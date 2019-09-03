#!/bin/bash
cd /etc/netplan
netplan apply 50-cloud-init.yaml
