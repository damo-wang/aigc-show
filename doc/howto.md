# Howto

## how to install npm in ubuntu24.04?

Install Latest Node.js + npm (recommended)

Ubuntu’s repo versions can be old. Use NodeSource to get the latest LTS.

- 1️⃣ Install prerequisites
```
    sudo apt update
    sudo apt install -y ca-certificates curl gnupg
```

- 2️⃣ Add NodeSource repo (example: Node 20 LTS)
```
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
```

- 3️⃣ Install Node.js (includes npm)
```
sudo apt install -y nodejs
```

Verify:

```
node -v
npm -v
```