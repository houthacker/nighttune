# Nighttune
Nighttune is a successor of [AutotuneWeb](https://github.com/MarkMpn/AutotuneWeb), and is in early stages of development.

## Introduction
This README is mainly a writeup of the installation and configuration of the tools required to run Nighttune on your own hardware. This README assumes a debian-derivative for all installation- and configuration instructions.

## Table of Contents
1. [Nighttune Components](#nighttune-components)
1. [Security](#security)

### Nighttune Components
TODO

### Security
To ensure safe communication between the Nighttune frontend and -backend, Nighttune uses the following strategies:
  * Run only on HTTPS
  * Use e-mail based TOTP
  * Firewall (ufw and iptables)

These concepts will not be explained in depth, but an installation-
and configuration howto _is_ part of this README.

#### 1. Prerequisites
Please ensure the following prerequisites have been installed:
| Prerequisite | Install location | Notes |
| :--- | :---: | :--- |
| [Apache httpd](https://httpd.apache.org/) | VM running frontend | The Apache HTTP server |
| [certbot](https://certbot.eff.org/) | VM running frontend | A commandline tool to automate certificate administration. |


#### 3. Configure UFW
The use of UFW a.k.a. <code>Uncomplicated Firewall</code> is _strongly_ recommended. To configure UFW, add the following rules.

_Note_: UFW is <b>not</b> used for rules regarding docker containers, since docker rules are executed before those of UFW.
```bash
# First allow yourself an exception, otherwise you'll get cut off.
$ sudo ufw allow from $your_ip to any port 22 proto tcp comment 'Allow SSH at port 22 from my computer'

# Allow HTTPS traffic
$ sudo ufw allow https


# By default, all incoming traffic must be denied and all
# outgoing traffic allowed
$ sudo ufw default deny incoming
$ sudo ufw default allow outgoing
```

#### 4. Restrict access to docker container(s)
To restrict access to exposed container ports to certain external IP addresses, create a persitent whitelist for your ip(s) and use them in the `DOCKER-USER` chain. This is optional but recommended.

_Note_: If you install this script, then by default all external access to your exposed ports is blocked.
```bash
# Copy the project file 'resources/docker-whitelist.template' to
# /usr/bin/docker-whitelist and make it executable
$ sudo chmod +x /usr/bin/docker-whitelist

# If you want to add an ip address, use the following. This only works
# after creating the systemd service below.
$ sudo docker-whitelist --add --ip <ip> --port <port>
```
Now expose the file you just created as a systemd service. This persist the whitelist rules across reboots.
```bash
# Copy the file 'resources/docker-whitelist.service' to
# /lib/systemd/system/docker-whitelist.service

# Reload the systemd deamon 
$ sudo systemctl daemon-reload

# Have the service start at boot
$ sudo systemctl enable docker-whitelist

# And start it
$ sudo systemctl start docker-whitelist
```