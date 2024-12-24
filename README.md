# grace

a game launcher with its own embedded bittorrent client and a self-managed repack scraper.
the launcher is written in typescript (electron) and python, which handles the torrenting system by using [libtorrent](https://www.libtorrent.org/).

## installation

### install node.js

ensure you have node.js installed on your machine. if not, download and install it from [nodejs.org](https://nodejs.org/).

### install yarn

yarn is a package manager for node.js. if you haven't installed yarn yet, you can do so by following the instructions on [yarnpkg.com](https://classic.yarnpkg.com/lang/en/docs/install/).

### clone the repository

```bash
git clone https://github.com/ifyoucanhear/grace.git
```

### install node dependencies

navigate to the project directory and install the node dependencies using yarn:

```bash
cd grace
yarn
```

### install python 3.9

ensure you have python installed on your machine. you can download and install it from [python.org](https://www.python.org/downloads/release/python-3919/).

### install python dependencies

install the required python dependencies using pip:

```bash
pip install -r requirements.txt
```

## environment variables

you'll need an steamgriddb api key in order to fetch the game icons on installation.
once you have it, you can paste the `.env.example` file and put it on `STEAMGRIDDB_API_KEY`.

## running

once you've got all things set up, you can run the following command to start both the electron process and the bittorrent client:

```bash
yarn start
```

## build

### build the bittorrent client

build the bittorrent client by using this command:

```bash
pyinstaller torrent-client/main.py --distpath resources/dist --icon=images/icon.ico -n grace-download-manager
```

### build the electron application

build the electron application by using this command:

```bash
yarn make
```

## license

grace is licensed under the [mit license](LICENSE).
