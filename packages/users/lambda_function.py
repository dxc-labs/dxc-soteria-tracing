import json
import boto3
import decimal
import datetime
import os
from boto3.dynamodb.conditions import Key, Attr

##################################################


def get_date_time_iso8610(now=True):
    date_time = datetime.datetime.utcnow()
    date_time = str(date_time.replace(microsecond=0).isoformat()) + "Z"
    return date_time


class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)


##################################################


def gen_response(status_code, body=None):

    if body:
        body = json.dumps(body, cls=DecimalEncoder)
    else:
        body = ""

    response = {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": body,
        "isBase64Encoded": False,
    }

    return response


##################################################


def get_user(userId):
    response = table.get_item(Key={"pk": f"PERSON#{userId}", "sk": "PERSON"},)
    try:
        return gen_response(200, response["Item"])
    except KeyError:
        return gen_response(404, "userId not found")


def get_user_checkins(userId):
    #! Should return 404 if userID not exists
    #! Not an empty array
    query_parameters = {
        "KeyConditionExpression": Key("pk").eq(f"PERSON#{userId}")
        & Key("sk").begins_with("CHECKIN#"),
        "Limit": 5,
    }
    response = table.query(**query_parameters)["Items"]
    return gen_response(200, response)


def post_user_checkins(userId, body):
    try:
        locationId = body["locationId"]

        # Create the checkin entity to be inserted
        item = {}
        item["pk"] = {"S": f"PERSON#{userId}"}
        item["sk"] = {"S": f"CHECKIN#{get_date_time_iso8610()}"}
        item["gsi2pk"] = {"S": f"LOCATION#{locationId}"}
        item["gsi2sk"] = item["sk"]

        """
        DynamoDB transaction does the following:
            1. Adds a checkin entity
            2. Updates user totalScans and lastScanned
            2. Updates location totalScans and lastScanned
        """

        client.transact_write_items(
            TransactItems=[
                # Add Checkin
                {"Put": {"TableName": os.environ["TABLE"], "Item": item,},},
                # Update person totalScans and lastScanned
                {
                    "Update": {
                        "TableName": os.environ["TABLE"],
                        "Key": {
                            "pk": {"S": f"PERSON#{userId}"},
                            "sk": {"S": "PERSON"},
                        },
                        "UpdateExpression": "SET totalScans=if_not_exists(totalScans, :start) + :inc, lastScanned=:ls",
                        "ExpressionAttributeValues": {
                            ":inc": {"N": "1"},
                            ":start": {"N": "0"},
                            ":ls": {"S": get_date_time_iso8610()},
                        },
                    }
                },
                # Update location totalScans and lastScanned
                {
                    "Update": {
                        "TableName": os.environ["TABLE"],
                        "Key": {
                            "pk": {"S": f"LOCATION#{locationId}"},
                            "sk": {"S": "LOCATION"},
                        },
                        "UpdateExpression": "SET totalScans=if_not_exists(totalScans, :start) + :inc, lastScanned=:ls",
                        "ExpressionAttributeValues": {
                            ":inc": {"N": "1"},
                            ":start": {"N": "0"},
                            ":ls": {"S": get_date_time_iso8610()},
                        },
                    }
                },
            ]
        )
        print(f"Added user checkin: {item}")

    except KeyError as err:
        return gen_response(400, f"Bad Input: Missing required property -> {str(err)}")

    """
    DynamoDB transaction does the following:
        - If checkout above was successfully completed
            - If checkin location has capacity attribute and capacity is > 0
                - If checkin location doesn't already have userId in active list
                    - Update location activeCount and add userId to active list
                - If checkin user doesn't already have locationId in active list
                    - Update user activeCount and add locationId to active list
    ! Need to add rejection if len(active) > capacity
    """
    try:
        client.transact_write_items(
            TransactItems=[
                {
                    "Update": {
                        "TableName": os.environ["TABLE"],
                        "Key": {
                            "pk": {"S": f"LOCATION#{locationId}"},
                            "sk": {"S": "LOCATION"},
                        },
                        "UpdateExpression": "SET activeCount=if_not_exists(activeCount, :zero) + :inc, active=list_append(if_not_exists(active, :emptyList), :personIdList)",
                        "ConditionExpression": "attribute_exists(#capacity) and #capacity > :zero and not contains (active, :personId)",
                        "ExpressionAttributeNames": {"#capacity": "capacity"},
                        "ExpressionAttributeValues": {
                            ":inc": {"N": "1"},
                            ":zero": {"N": "0"},
                            ":personId": {"S": f"PERSON#{userId}"},
                            ":personIdList": {"L": [{"S": f"PERSON#{userId}"}]},
                            ":emptyList": {"L": []},
                        },
                    }
                },
                {
                    "Update": {
                        "TableName": os.environ["TABLE"],
                        "Key": {
                            "pk": {"S": f"PERSON#{userId}"},
                            "sk": {"S": "PERSON"},
                        },
                        "UpdateExpression": "SET activeCount=if_not_exists(activeCount, :zero) + :inc, active=list_append(if_not_exists(active, :emptyList), :locationIdList)",
                        "ConditionExpression": "not contains (active, :locationId)",
                        "ExpressionAttributeValues": {
                            ":inc": {"N": "1"},
                            ":zero": {"N": "0"},
                            ":locationId": {"S": f"LOCATION#{locationId}"},
                            ":locationIdList": {"L": [{"S": f"LOCATION#{locationId}"}]},
                            ":emptyList": {"L": []},
                        },
                    }
                },
            ]
        )
        print(f"Processed active for {locationId},{userId}")
    except Exception as e:
        """
        Expect transaction to fail if:
            - location does not have capacity
            - location capacity = 0
            - user is already actively checked in to a location
        """
        print(str(e))
        pass

    return gen_response(201)


def post_user_sanitizations(userId, body):
    try:
        locationId = body["locationId"]

        item = {}
        item["pk"] = {"S": f"PERSON#{userId}"}
        item["sk"] = {"S": f"SANITIZATION#{get_date_time_iso8610()}"}
        item["gsi2pk"] = {"S": f"LOCATION#{locationId}"}
        item["gsi2sk"] = item["sk"]

        """
        DynamoDB transaction does the following:
            1. Adds a checkin entity
            2. Updates user totalScans and lastScanned
            2. Updates location totalScans and lastScanned
        """

        client.transact_write_items(
            TransactItems=[
                {"Put": {"TableName": os.environ["TABLE"], "Item": item,},},
                {
                    "Update": {
                        "TableName": os.environ["TABLE"],
                        "Key": {
                            "pk": {"S": f"PERSON#{userId}"},
                            "sk": {"S": "PERSON"},
                        },
                        "UpdateExpression": "SET totalScans=if_not_exists(totalScans, :start) + :inc, lastScanned=:ls",
                        "ExpressionAttributeValues": {
                            ":inc": {"N": "1"},
                            ":start": {"N": "0"},
                            ":ls": {"S": get_date_time_iso8610()},
                        },
                    }
                },
                {
                    "Update": {
                        "TableName": os.environ["TABLE"],
                        "Key": {
                            "pk": {"S": f"LOCATION#{locationId}"},
                            "sk": {"S": "LOCATION"},
                        },
                        "UpdateExpression": "SET totalScans=if_not_exists(totalScans, :start) + :inc, lastSanitized=:ls",
                        "ExpressionAttributeValues": {
                            ":inc": {"N": "1"},
                            ":start": {"N": "0"},
                            ":ls": {"S": get_date_time_iso8610()},
                        },
                    }
                },
            ]
        )
        print(f"Added: {item}")

    except KeyError as err:
        return gen_response(400, f"Bad Input: Missing required property -> {str(err)}")

    return gen_response(201)


def post_user_checkouts(userId, body):
    #! This needs to be updated for Active checkouts
    try:
        locationId = body["locationId"]

        item = {}
        item["pk"] = {"S": f"PERSON#{userId}"}
        item["sk"] = {"S": f"CHECKOUT#{get_date_time_iso8610()}"}
        item["gsi2pk"] = {"S": f"LOCATION#{locationId}"}
        item["gsi2sk"] = item["sk"]

        client.transact_write_items(
            TransactItems=[
                # Add Checkin
                {"Put": {"TableName": os.environ["TABLE"], "Item": item}},
                # Update person totalScans and lastScanned
                {
                    "Update": {
                        "TableName": os.environ["TABLE"],
                        "Key": {
                            "pk": {"S": f"PERSON#{userId}"},
                            "sk": {"S": "PERSON"},
                        },
                        "UpdateExpression": "SET totalScans=if_not_exists(totalScans, :start) + :inc, lastScanned=:ls",
                        "ExpressionAttributeValues": {
                            ":inc": {"N": "1"},
                            ":start": {"N": "0"},
                            ":ls": {"S": get_date_time_iso8610()},
                        },
                    }
                },
                # Update location totalScans and lastScanned
                {
                    "Update": {
                        "TableName": os.environ["TABLE"],
                        "Key": {
                            "pk": {"S": f"LOCATION#{locationId}"},
                            "sk": {"S": "LOCATION"},
                        },
                        "UpdateExpression": "SET totalScans=if_not_exists(totalScans, :start) + :inc, lastScanned=:ls",
                        "ExpressionAttributeValues": {
                            ":inc": {"N": "1"},
                            ":start": {"N": "0"},
                            ":ls": {"S": get_date_time_iso8610()},
                        },
                    }
                },
            ]
        )
        print(f"Added user checkout: {item}")

    except KeyError as err:
        return gen_response(400, f"Bad Input: Missing required property -> {str(err)}")

    """
    DynamoDB transaction does the following:
        - If checkout above was successfully completed
            - Get user and location
            - Get idx of ID's from respective active list
            - Remove ID's from respective active list and lower activeCount by 1
    """
    try:
        """
        Need to look up both the user and location prior to prior to performing transaction
            Reason is that we need to know the index of both ID's in their respective list
            We use the idx to tell the transaction what idx to remove
        #! Might be a chance to optimise if we work out how to do this within the transaction.
        """
        location = table.get_item(
            Key={"pk": f"LOCATION#{locationId}", "sk": "LOCATION"}
        )["Item"]
        user = table.get_item(Key={"pk": f"PERSON#{userId}", "sk": "PERSON"})["Item"]

        # Get idx of locationId/userId - Used in transaction remove
        idxPersonId = location["active"].index(f"PERSON#{userId}")
        idxLocationId = user["active"].index(f"LOCATION#{locationId}")

        client.transact_write_items(
            TransactItems=[
                # Update LOCATION - Lower activeCount and remove personId from active
                {
                    "Update": {
                        "TableName": os.environ["TABLE"],
                        "Key": {
                            "pk": {"S": f"LOCATION#{locationId}"},
                            "sk": {"S": "LOCATION"},
                        },
                        "UpdateExpression": f"REMOVE active[{idxPersonId}] SET activeCount=activeCount - :inc",
                        "ExpressionAttributeValues": {":inc": {"N": "1"},},
                    }
                },
                {
                    # Update PERSON - Lower activeCount and remove locationId from active
                    "Update": {
                        "TableName": os.environ["TABLE"],
                        "Key": {
                            "pk": {"S": f"PERSON#{userId}"},
                            "sk": {"S": "PERSON"},
                        },
                        "UpdateExpression": f"REMOVE active[{idxLocationId}] SET activeCount=activeCount - :inc",
                        "ExpressionAttributeValues": {":inc": {"N": "1"},},
                    }
                },
            ]
        )
        print(f"Processed active checkout for {locationId},{userId}")

    except Exception as e:
        print(str(e))
        pass

    return gen_response(201)


##################################################
# MAIN HANDLER
##################################################

client = boto3.client("dynamodb")
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE"])


def lambda_handler(event, context):
    print(f"Received Event: {event}")
    try:
        resource = event["resource"]
        httpMethod = event["httpMethod"]

        try:
            userId = event["pathParameters"]["userId"]
            if not userId:
                return gen_response(400, f"Bad Input: Missing userId")

            if resource == "/users/{userId}":
                if httpMethod == "GET":
                    return get_user(userId)

            elif resource == "/users/{userId}/checkins":
                if httpMethod == "GET":
                    return get_user_checkins(userId)
                elif httpMethod == "POST":
                    if not event["body"]:
                        return gen_response(400, "missing request body")
                    return post_user_checkins(userId, json.loads(event["body"]))

            elif resource == "/users/{userId}/sanitizations":
                # if httpMethod == "GET":
                #     return get_user_sanitizations(userId)
                if httpMethod == "POST":
                    if not event["body"]:
                        return gen_response(400, "missing request body")
                    return post_user_sanitizations(userId, json.loads(event["body"]))

            elif resource == "/users/{userId}/checkouts":
                if httpMethod == "POST":
                    if not event["body"]:
                        return gen_response(400, "missing request body")
                    return post_user_checkouts(userId, json.loads(event["body"]))

            else:
                return gen_response(400, f"Request not supported")

        except (KeyError, TypeError) as err:
            return gen_response(400, f"Bad Input: Missing {str(err)}")

    except Exception as e:
        raise e
