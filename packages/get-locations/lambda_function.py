import json
import boto3
import decimal
import os
from boto3.dynamodb.conditions import Key, Attr

# *#################################################


class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)


# *#################################################


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
        body = j_dumps(body)
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


# *#################################################


def lambda_handler(event, context):
    print(f"Received Event: {event}")
    table_name = os.environ["TABLE"]
    table = boto3.resource("dynamodb").Table(table_name)

    ############################################
    query_shards = 25
    ############################################
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
        query_shards = int(1)

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
        for x in range(0, query_shards):
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
        for x in range(0, query_shards):
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
                del location["gsi1sk"]
            except:
                pass
            finally:
                result.append(location)

    if limit:
        limit = int(limit)
        if len(result) > limit:
            result = result[:limit]

    return gen_response(200, result)
