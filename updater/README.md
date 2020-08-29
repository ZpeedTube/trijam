# Updater
For auto updating this git repository. (You need to be collaborator to be albe to run this.)

## installation 
For this program to work you need to have installed Node.js with npm AND github command line interface.
You can find Node.js here https://nodejs.org/ and github CLI here https://github.com/cli/cli .
Then use 'git clone https://github.com/ZpeedTube/trijam' to download this github repository.
After installing these the final step is to open (this) folder in terminal/console and type 'npm i' wich will download and install the updater dependencies.
You should be done now.

## usage
Before running this you need to sign in with your github account, use this first '**sudo git config --global credential.helper store**' so you don't have to re sign in every time.
Then run this '**git pull**' and should now ask for your credentials when you run this '**git push**', remember that you have to be in the trijam folder that you downloaded with git clone.

To run the **updater**, open (this) folder in your terminal/console and type **'npm start'** or **'node .'**.

If they fail then try:
- linux: adding **'sudo '** in front.
- windows: opening cmd with **Run as administator**.


## startup command arguments
- **'node . [trijam number]'** Example: *'node . 90'* will add winner(s) of Trijam 90.
- **'node . [trijam number] [placement]'** Example: *'node . 90 2'* will add winner(s) of Trijam 90 on 2nd place as winner.
