#!/bin/bash

if test -d packages; then
    pushd packages
    for d in $(basename '*/'); do
        echo Packaging $d...
        if test -f $d/requirements.txt; then # Python
            echo $d: installing python requirements...
            # pip install --target=$d -r $d/requirements.txt;
        fi
        if test -f $d/package.json; then # Node.js
            echo $d: installing Node.js requirements

            if grep -q react package.json; then # React
                if [ -f ../../.env ]; then      # prefix envars with REACT_APP_ for security
                    sed -e 's/^/REACT_APP_/' ../../.env >.env
                fi
            fi
            npm --prefix $d install $d/
            if grep -q build $d/package.json; then # TODO parse json for scripts['build']
                echo "Build React Applicaiton"
                npm --prefix $d --env=${EnvironmentName} run build $d/
            fi
        fi
        # zip directory (zip returns error 12 when empty)
        pushd ./$d
        echo $d: archiving to $d.zip file
        # zip -r9 "../$d.zip" . 2>&1 >/dev/null
        popd

        if [ $d = "webroot" ]; then # copy in place for 'distribution' component
            if aws s3api head-bucket --bucket $ORIGIN; then
                if [ -d webroot/build ]; then
                    echo "Syncing /packages/webroot/build to s3://$ORIGIN/${ComponentName}"
                    # aws s3 sync --delete webroot/build s3://$ORIGIN/${ComponentName}
                else
                    echo "Syncing /packages/webroot to s3://$ORIGIN/${ComponentName}"
                    # aws s3 sync --delete webroot s3://$ORIGIN/${ComponentName}
                fi
            else
                echo "Skipping sync of /packages/webroot[/build] to s3://$ORIGIN/${ComponentName}[/build] as the bucket does not exist"
                echo "This will likely result in your web interface not being available"
            fi
        fi

        if [ $d = "openapi" ]; then # copy in place for cloudformation deployment
            if aws s3api head-bucket --bucket $OPENAPI; then
                echo "Syncing openapi to s3://$OPENAPI/${ComponentName}"
                # aws s3 sync --delete openapi s3://$OPENAPI/${ComponentName}
            else
                echo "Bucket does not exist s3://$OPENAPI/${ComponentName}"
                echo "This will likely result in CloudFormation deploy failure if reliant on openapi"
            fi
        fi
    done
    popd
fi
