def lambda_handler(event, context):
    print(f"Received Event: {event}")
    for record in event["Records"]:
        eventName = record["eventName"]
        if eventName == "INSERT":
            pass
        if eventName == "MODIFY":
            pass
        if eventName == "DELETE":
            pass
    print(f"Successfully processed {str(len(event['Records']))} records.")
