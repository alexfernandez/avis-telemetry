# Avis Telemetry Installation

So you want to install your own telemetry server?
You will need Node.js, nginx and a solid OS (preferably Linux-based).

## Basic Installation

We will outline how to install on [Ubuntu LTS](https://releases.ubuntu.com/).
It is quite similar using Fedora Linux and other distributions.

First download [Node.js](https://nodejs.org/en/download)
using [NodeSource](https://github.com/nodesource/distributions?tab=readme-ov-file#debian-and-ubuntu-based-distributions),
which on Ubuntu sets up a nice package regularly updated with security patches.
After running the setup script, just install `nodejs`:

```
$ sudo apt install nodejs
```

Now download [avis-telemetry](https://github.com/alexfernandez/avis-telemetry) on the home directory,
enter the new directory and install the necessary packages:

```
git clone https://github.com/alexfernandez/avis-telemetry.git
cd avis-telemetry
npm install
```

To run the server you can invoke it using the following command:

```
npm start
```

At this point you should see a nice prompt, stating it is ready to accept requests to port 4215 by default.

## Nginx

Now we need to expose our new Node.js server to the outside world.
To secure access, first install nginx:

```
$ sudo apt install nginx
```

Now edit a file called e.g. `/etc/nginx/sites-enabled/avis-telemetry.conf`,
and configure for your particular domain (e.g. `avistel.pinchito.es`):

```
server {
        listen 443 ssl ;
        listen [::]:443 ssl ;

        root /var/www/html;

        index index.html index.htm index.nginx-debian.html;
        server_name avistel.pinchito.es; # managed by Certbot

        # logs
        access_log /var/log/nginx/access-avis-telemetry.log;
        error_log /var/log/nginx/error-avis-telemetry.log;

        location / {
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_pass http://localhost:4215/;
        }
}
```

To create an HTTPS certificate just use
[EFF's CertBot](https://certbot.eff.org/):

```
sudo apt install certbot
sudo certbot
```

And follow the on-screen instructions for your domain.

## Database

The database is [SQLite](https://sqlite.org/) so it requires no installation.
By default it will reside in a file called `avis-telemetry/local.db`.
If you want to do a backup, just copy this file somewhere else.

