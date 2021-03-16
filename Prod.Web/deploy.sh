#!/bin/bash -e
echo "Removing old artifacts"
curl -X POST -H 'Content-type: application/json' --data '{"text":"deploy rl2021-frontend"}' $slackaddy
echo "Deploying artifacts to test"
sshpass -p $scp_pass scp -v -r -o StrictHostKeyChecking=no  ~/build/Artsdatabanken/Rodliste2019/Prod.Web/dist/* $scp_user@$scp_dest
