#!/bin/bash
#cd /etc/netplan
sudo -i rm -rf /etc/netplan/50-cloud-init.yaml
sudo -i cd /etc/netplan/module001
sudo -i chmod 777 /etc/netplan/module001/50-cloud-init.yaml
sudo -i cp /etc/netplan/module001/50-cloud-init.yaml /etc/netplan/
#sudo -i chmod 777 /etc/netpaln/50-cloud-init.yaml
#netplan apply 50-cloud-init.yaml
#echo sunzhang > /etc/module001/testshell.txt

