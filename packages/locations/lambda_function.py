import json
import boto3
import decimal
import datetime
import random
import uuid
import os
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError

##################################################


class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)


##################################################
# Helpers
##################################################
def get_query_params(event):
    query_params = event.get("queryStringParameters", None)
    return query_params


def get_from_query_params(event, key):
    query_params = get_query_params(event)
    if not query_params:
        return None
    return query_params.get(key, None)


def j_dumps(json_obj):
    return json.dumps(json_obj, cls=DecimalEncoder)

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


def get_locations(event,shards):
    
    # Handle query params
    query_parameters = {}
    # Search - Begins with query
    query = get_from_query_params(event, "q")
    # Contains - Filter condition (case sensitive)
    search = get_from_query_params(event, "s")
    # Limit - How many items to return
    limit = get_from_query_params(event, "limit")
    # Fields - What fields to return
    fields = get_from_query_params(event, "fields")
    # Root - Return only roots
    root = get_from_query_params(event, "root")

    if root:
        shards = int(0) 

    if fields:
        expression_attribute_names = {}
        projection_expression = ""
        for field in fields.split(","):
            # Build projection expression ensuring no DynamoDB keywords
            #   Prefix #, standard practice with DYNAMODB
            expression_attribute_names.update({f"#{field}": field})
            projection_expression += f"#{field},"

        query_parameters.update(
            {
                "ProjectionExpression": projection_expression[:-1],
                "ExpressionAttributeNames": expression_attribute_names,
            }
        )

    if search:
        # Case Sensitive
        query_parameters.update(
            {"FilterExpression": Attr("locationCode").contains(search)}
        )

    if query:
        query = query.replace("~", "#")
        query_parameters.update(
            {
                "KeyConditionExpression": Key("gsi1pk").eq(
                    f"LOCATION#{query.split('#')[0]}"
                )
                & Key("gsi1sk").begins_with(query)
            }
        )

    ############################################
    # Get the data

    if query:
        locations = []
        for x in range(0, shards + 1):
            query_parameters.update(
                {
                    "KeyConditionExpression": Key("gsi1pk").eq(f"LOCATION#{x}")
                    & Key("gsi1sk").begins_with(query)
                }
            )
            part_locations = table.query(**query_parameters, IndexName="GSI1",)["Items"]
            locations.extend(part_locations)

    else:
        locations = []
        for x in range(0, shards + 1): 
            query_parameters.update(
                {"KeyConditionExpression": Key("gsi1pk").eq(f"LOCATION#{x}")}
            )
            part_locations = table.query(**query_parameters, IndexName="GSI1",)["Items"]
            locations.extend(part_locations)

    ############################################
    # Transform response away from data-model
    # Can this be refact?
    result = []
    for location in locations:
        if location:
            # Filter out empty elements
            try:
                del location["pk"]
                del location["sk"]
                del location["gsi1pk"]
            except:
                pass
            finally:
                result.append(location)

    if limit:
        limit = int(limit)
        if len(result) > limit:
            result = result[:limit]

    return gen_response(200, result)


def get_location(locationId):
    """
    Get a location by locationId

    Parameters:
        locationId: id of the location
            example=661e0f26-0fb9-46e3-b4e3-57a66b9835b8

    Returns:
        single location
    """
    response = table.get_item(Key={"pk": f"LOCATION#{locationId}", "sk": "LOCATION"})
    try:
        return gen_response(200, response["Item"])
    except KeyError:
        return gen_response(404, "locationId not found")


def post_locations(payload):
    """
    Adds one to many new locations with supplied attributes
    Will also attempt to add hierarchy of location if not already exist

    Parameters:
        payload: either a dict or list
            example={"locationCode": "Australia#Victoria#Docklands#Level19#Innovation Lab"}
            example=[
                        {"locationCode": "Australia#Victoria#Docklands#Level19#Innovation Lab, "owner": "xxx@example.com", "capacity": 12},
                        {"locationCode": "Australia#Victoria#Docklands#Level19, "owner": "xxx@example.com", "capacity": 56},
                        {"locationCode": "Australia#Victoria#Docklands, "owner": "xxx@example.com", "capacity": 212},
                    ]

    UseCase:
        - Admin wants to add one to many new locations

    Returns:
        list of added locations
    """
    # The transaction will fail(pass) if the locationCode already exists
    # # https://aws.amazon.com/blogs/database/simulating-amazon-dynamodb-unique-constraints-using-transactions/

    if isinstance(payload, dict):
        payload = [payload]

    items = []
    heirarchyLevel = []
    for location in payload:
        # Construct list of object to be added
        if not "locationCode" in location:
            return gen_response(400, "Bad Input: Payload must contain locationCode")

        shard = random.randint(1, shards)
        
        # Logic to create heirarchy of locations based on given locationCode
        """
          1. Split the locationCode into levels
          2. Loop through each and construct the heirarchy locationCode
        """
        
        heirarchyData  = location["locationCode"].split("#")
        temp = " "
        
        for i in range(0,len(heirarchyData)-1):
          temp = temp + f"#{heirarchyData[i]}"     
          if(i==0):
              temp = heirarchyData[i]
              
          shard = random.randint(1, shards)
          if len(temp.split("#")) == 1:
             shard = 0
          if temp not in heirarchyLevel:
                heirarchyLevel.append(temp)
                item = {}
                item["pk"] = {"S": f"LOCATIONCODE"}
                item["sk"] = {"S": f"{temp}"}
                item["gsi1pk"] = {"S": f"LOCATION#{shard}"}
                item["gsi1sk"] = {"S": f"{temp}"}
                item["allocated"] = {"BOOL": False}
                item["locationCode"] = {"S": f"{temp}"} 
                items.append(item)
        
        # continue creating location entry for given locationCode
        
        item = {}
        item["pk"] = {"S": f"LOCATIONCODE"}
        item["sk"] = {"S": f"{location['locationCode']}"}
        item["gsi1pk"] = {"S": f"LOCATION#{shard}"}
        item["gsi1sk"] = {"S": f"{location['locationCode']}"}
        item["allocated"] = {"BOOL": False}
        item["locationCode"] = {"S": f"{location['locationCode']}"}

        # Type casting match for DynamoDB types from Python types
        for prop in location:
            if prop != "locationCode":
                ddbType = "S"
                if isinstance(location[prop], str):
                    if location[prop].isnumeric():
                        ddbType = "N"
                if isinstance(location[prop], int):
                    location[prop] = str(location[prop])
                    ddbType = "N"
                elif isinstance(location[prop], list):
                    ddbType = "L"
                elif isinstance(location[prop], dict):
                    ddbType = "M"
                elif isinstance(location[prop], bool):
                    ddbType = "BOOL"

                item[prop] = {ddbType: location[prop]}
            #! Need to ensure dirty data not coming through

        items.append(item)

    result = {
        "added": [],
        "exists": [],
        "erroneous": [],
    }

    for item in items:
        try:
            client.transact_write_items(
                TransactItems=[
                    {
                        "Put": {
                            "ConditionExpression": "attribute_not_exists(pk) and attribute_not_exists(sk)",
                            "TableName": os.environ["TABLE"],
                            "Item": item,
                        }
                    },
                ]
            )
            result["added"].append(item["sk"]["S"])

        except ClientError as err:
            if err.response["Error"]["Code"] == "TransactionCanceledException":
                result["exists"].append(item["sk"]["S"])
            else:
                result["erroneous"].append(item["sk"]["S"])

    #! We should also be adding the full hierarchy
    #! This will be handled from the streams
    return gen_response(201, result)


def patch_location(locationId, payload):
    """
    Updates attributes of an existing location

    Parameters:
        locationId: locationId of the location entity to update
            example=3b3ee906-4127-41a6-80fa-939d1c1b617e
        payload: dict of attributes to be updated
            example={locationCode: "Australia#Victoria#Docklands#Level19#Innovation Lab"}
            example={"capcity": "1545", "owner":"xxx@example.com"}

    UseCase:
        - User scans a QR code and wants to assign it to a locationCode
            - locationCode already exists
            - locationCode not already exists
        - Admin wants to update location attributes
            - update seat capacity
        ?- Admin wants to allocate a locationId to an existing locationCode
        !- Admin wants to allocate a locationId to a non existing locationCode
        

    Returns:
        updated location
    """

    if not payload:
        return gen_response(400, "Bad Input: Payload cannot be empty")

    if "locationCode" in payload:
        # Special case for admin allocating a locationCode to a locationId
        # * Find location by locationCode in DynamoDB

        try:
            location = table.get_item(
                Key={"pk": "LOCATIONCODE", "sk": payload["locationCode"]},
            )["Item"]

        except KeyError:
            """ TODO
            # Location not exist and user is trying to add locationCode (that doesn't exist) to a locationId
            # We will also need to extract other props from the payload and assign to the locationId
            #? Add {"pk": "LOCATIONCODE", "sk": payload["locationCode"], "allocated": TRUE}
            #? UPDATE {"pk": "LOCATION#ID", "sk": LOCATION, "allocated": TRUE, GSIPK and GSI1SK and other props submitted}
            """
            # return gen_response(404, "locationCode not found")
            shard = random.randint(1, shards)
            location = {"pk": "LOCATIONCODE", "sk": payload["locationCode"], "gsi1pk":f"LOCATION#{shard}", "gsi1sk":payload["locationCode"], "allocated": True, "locationCode":f"{payload['locationCode']}"} 

        updateExpressionlist = []
        expressionAttributeNames = {}
        expressionAttributeValues = {}

        for prop in location:
            if (prop != "pk") and (prop != "sk"):
                updateExpressionlist.append(f"#{prop}=:{prop}")
                expressionAttributeNames[f"#{prop}"] = prop
                # Check type and set compatible with DynamoDB (defaults to string)
                ddbType = "S"

                # location
                if isinstance(location[prop], bool):
                    ddbType = "BOOL"

                elif isinstance(location[prop], str):
                    if location[prop].isnumeric():
                        ddbType = "N"

                elif isinstance(location[prop], int):
                    location[prop] = str(location[prop])
                    ddbType = "N"

                elif isinstance(location[prop], decimal.Decimal):
                    location[prop] = str(location[prop])
                    ddbType = "N"

                elif isinstance(location[prop], list):
                    ddbType = "L"

                elif isinstance(location[prop], dict):
                    ddbType = "M"

                if prop == "allocated":
                    location[prop] = True

                expressionAttributeValues[f":{prop}"] = {ddbType: location[prop]}

            updateExpression = f'SET {",".join(updateExpressionlist)}'

        #! Make sure user cant allocate LocationCode if the location already has one
        response = client.transact_write_items(
            TransactItems=[
                {
                    "Update": {
                        "TableName": os.environ["TABLE"],
                        "Key": {
                            "pk": {"S": f"LOCATION#{locationId}"},
                            "sk": {"S": "LOCATION"},
                        },
                        "UpdateExpression": updateExpression,
                        "ExpressionAttributeNames": expressionAttributeNames,
                        "ExpressionAttributeValues": expressionAttributeValues,
                    },
                },
                {
                    "Put": {
                        "TableName": os.environ["TABLE"],
                        "Item": {
                            "pk": {"S": f"LOCATIONCODE"},
                            "sk": {"S": payload["locationCode"]},
                            "allocated": {"BOOL": True},
                        },
                    },
                },
            ]
        )
        return gen_response(200)
    else:
        updateExpressionlist = []
        expressionAttributeNames = {}
        expressionAttributeValues = {}
    
        for attr in payload:
            updateExpressionlist.append(f"#{attr}=:{attr}")
            expressionAttributeNames[f"#{attr}"] = attr
            expressionAttributeValues[f":{attr}"] = payload[attr]
    
        updateExpression = f'SET {",".join(updateExpressionlist)}'
    
        response = table.update_item(
            Key={"pk": f"LOCATION#{locationId}", "sk": "LOCATION"},
            UpdateExpression=updateExpression,
            ExpressionAttributeNames=expressionAttributeNames,
            ExpressionAttributeValues=expressionAttributeValues,
            ReturnValues="ALL_NEW",
        )
    
        return gen_response(201, response["Attributes"])


def get_location_checkins(locationId):
    #! Add logic to help with contact tracing
    response = table.query(
        IndexName="GSI2",
        KeyConditionExpression=Key("gsi2pk").eq(f"LOCATION#{locationId}")
        & Key("gsi2sk").begins_with("CHECKIN#"),
    )["Items"]
    return gen_response(200, response)



##################################################
# MAIN HANDLER
##################################################
client = boto3.client("dynamodb")
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE"])
shards = 5


def lambda_handler(event, context):
    print(f"Received Event: {event}")
    try:
        resource = event["resource"]
        httpMethod = event["httpMethod"]

        try:
            if resource == "/locations":
                if httpMethod == "GET":
                    #! Update with query params
                    return get_locations(event,shards)
                elif httpMethod == "POST":
                    if not event["body"]:
                        return gen_response(400, "missing request body")
                    return post_locations(json.loads(event["body"]))
          
            else:
                locationId = event["pathParameters"]["locationId"]
                if not locationId:
                    return gen_response(400, f"Bad Input: Missing locationId")

                if resource == "/locations/{locationId}":
                    if httpMethod == "GET":
                        return get_location(locationId)
                    elif httpMethod == "PATCH":
                        if not event["body"]:
                            return gen_response(400, "missing request body")
                        return patch_location(locationId, json.loads(event["body"]))
                elif resource == "/locations/{locationId}/checkins":
                    if httpMethod == "GET":
                        return get_location_checkins(locationId)

        except (KeyError, TypeError) as err:
            return gen_response(400, f"Bad Input: Missing {str(err)}")

    except Exception as err:
        raise err
