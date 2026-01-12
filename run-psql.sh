#!/bin/bash
docker run -it --rm --network timemanager_default postgres:17 psql -h db -U testadmin -d timemanager
