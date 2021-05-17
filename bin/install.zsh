#!/bin/zsh

cp systemd/clockwork.service /etc/systemd/system/clockwork.service
systemctl enable clockwork
systemctl start clockwork
