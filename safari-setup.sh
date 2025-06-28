#!/bin/bash

RED="\033[1;31m"
GREEN="\033[1;32m"
NOCOLOR="\033[0m"

echo -e "${GREEN}Insatlling local ssl proxy....${ENDCOLOR}"

# Install local ssl proxy
npm install -g local-ssl-proxy

echo -e "${GREEN}Installing certificate generation utilities locally....${ENDCOLOR}"
brew install mkcert nss

echo -e "${GREEN}Generating SSL certificate....${ENDCOLOR}"
mkcert --install && mkcert bs-local.com

echo -e "${GREEN}Updating hosts file to work in safari....${ENDCOLOR}"
ip_address="127.0.0.1"
# APIs to work on custom server our custom domain should be ending with .gripinvest.in
host_name="hello.gripinvest.in"

# find existing instances in the host file and save the line numbers
matches_in_hosts="$(grep -n $host_name /etc/hosts | cut -f1 -d:)"
host_entry="${ip_address} ${host_name}"

echo -e "${RED}Please enter your password if requested${ENDCOLOR}"

if [ ! -z "$matches_in_hosts" ]
then
    echo "Updating existing hosts entry."
    # iterate over the line numbers on which matches were found
    while read -r line_number; do
        # replace the text of each line with the desired host entry
        sudo sed -i '' "${line_number}s/.*/${host_entry} /" /etc/hosts
    done <<< "$matches_in_hosts"
else
    echo "Adding new hosts entry."
    echo "$host_entry" | sudo tee -a /etc/hosts > /dev/null
fi

echo -e "${GREEN}Hosts file is updated${ENDCOLOR}"
echo -e "${GREEN}Starting your server on hello.gripinvest.in${ENDCOLOR}"
yarn safari:dev
