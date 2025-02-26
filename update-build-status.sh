#!/bin/sh

#Fail fast
set -e
#set -x

# import log helper and set log file
export PATH=/home/$USER/build-status:$PATH
source ./shell-log-helper.sh /home/$USER/update-build-status.log

SCRIPTENTRY

function update() {
	ENTRY
	INFO "Updating build-status [@1]"
	if [[ "$1" == "live" ]] && [[ "$2" != "restore" ]]
	then 
		envSetupLive
		printEnvSetup
		stopService
		cleanup
		backup $2
		uninstall
		download
		install
	elif [[ "$1" == "beta" ]] && [[ "$2" != "restore" ]]
	then
		envSetupBeta $2
		printEnvSetup
		stopService
		cleanup
		backup $2
		uninstall
		downloadBeta
		install
	elif [[ "$1" == "local" ]]
	then 
		envSetupLocal
		printEnvSetup
		cleanup
		backup $2
		uninstall
		download
		install
	elif [[ "$1" == "live" ]] && [[ "$2" == "restore" ]]
	then 
		envSetupLive
		printEnvSetup
		stopService
		cleanup
		uninstall
		restore
	elif [[ "$1" == "beta" ]] && [[ "$2" == "restore" ]]
	then 
		envSetupBeta "fromBackup"
		printEnvSetup
		stopService
		cleanup
		uninstall
		restore
	else 
		ERROR "Must specify 'local', 'beta' or 'live'"
		exit 1
	fi
	if [[ "$1" != "local" ]]
	then 
		activate
		startService
	elif [[ "$1" == "local" ]]
	then 
		INFO "Not activating for LOCAL TEST!"
	fi
	RETURN OK - FINISH!
}

function envSetupGeneric() {
	ENTRY
	INFO "setup env. variables [GENERIC]"
	pagesURL=https://ci.sbb.ch/job/mvp.shared.smoothie.generate-checkstatus-pages.develop/lastSuccessfulBuild/artifact/*zip*/pages.zip
	indexURL=https://ci.sbb.ch/job/mvp.shared.smoothie.generate-checkstatus-index.develop/lastSuccessfulBuild/artifact/*zip*/index.zip
	buildStatusURL=https://code.sbb.ch/scm/mvp_shared/build-status.git
	RETURN OK
}


function envSetupLocal() {
	ENTRY
	INFO "setup env. variables [LOCAL TESTING]"
	envSetupGeneric
	tempDir=/cygdrive/d/data/build-status-cron/temp
	bakDir=/cygdrive/d/data/build-status-cron/backup
	installDir=/cygdrive/d/data/build-status-generated
	RETURN OK
}

function envSetupLive() {
	ENTRY
	INFO "setup env. variables [LIVE]"
	envSetupGeneric
	tempDir=/home/$USER/temp
	bakDir=/home/$USER/backup/build-status
	installDir=/home/$USER/build-status
	liveHostDir=/var/www/html/build-status
	RETURN OK
}

function envSetupBeta() {
	ENTRY
	INFO "setup env. variables [BETA]"
	envSetupGeneric
	tempDir=/home/$USER/temp
	bakDir=/home/$USER/backup/build-status-beta
	installDir=/home/$USER/build-status-beta
	liveHostDir=/var/www/html/build-status-beta
	betaBranch=$1
	RETURN OK
}

function printEnvSetup() {
	ENTRY
	INFO "Pages data URL: $pagesURL"
	INFO "Index data URL: $indexURL"
	INFO "Build Status git URL: $buildStatusURL"
	INFO "Install temp dir: $tempDir"
	INFO "Backup dir: $bakDir"
	INFO "Installation dir: $installDir"
	INFO "Apache Httpd host dir: $liveHostDir"
	RETURN OK
}

function cleanup() {
	ENTRY
	INFO "remove old temp dir and re-create dirs"
	sudo rm -rf $tempDir
	mkdir --parents $bakDir
	mkdir --parents $tempDir
	mkdir --parents $installDir
	RETURN OK
}

function backup() {
	ENTRY
	if [ "$1" == "nobackup" ]
	then
		INFO "no backup is created - probably ran by cron job!"
	else
		timestamp=`date '+%d-%m-%Y_%H-%M-%S'`
		INFO "creating backup of current build-status [$installDir] --> [$bakDir/$timestamp]"
		mkdir --parents $bakDir/"$timestamp"
		mkdir --parents $bakDir/latest
		sudo cp -a --force $installDir $bakDir/"$timestamp"
		sudo cp -a --force $installDir $bakDir/latest
	fi
	RETURN OK
}

function restore() {
	ENTRY
	INFO "restoring LATEST backup of build-status from [$bakDir/latest]"
	mkdir --parents $installDir
	sudo cp -a --force $bakDir/latest/**/* $installDir
	RETURN OK
}

function uninstall() {
	ENTRY
	INFO "remove current build-status installation"
	sudo rm -rf $installDir
	sudo rm -rf $liveHostDir
	RETURN OK 
}

function download() {
	ENTRY
	INFO "get latest version of build-status code from git repo"
	mkdir --parents $installDir && cd $installDir && git clone $buildStatusURL $installDir
	RETURN OK
}

function downloadBeta() {
	ENTRY
	INFO "get latest beta version [$betaBranch] of build-status code from git repo"
	download
	git checkout --force $betaBranch
	RETURN OK
}

function install() {
	ENTRY
	INFO "download and install latest build-status pages and data"
	mkdir --parents $installDir
	wget -O $tempDir/pages.zip $pagesURL
	wget -O $tempDir/index.zip $indexURL
	unzip -o -q $tempDir/pages.zip -d $tempDir
	unzip -o -q $tempDir/index.zip -d $tempDir
	cp -r $tempDir/archive/build-status-generated/* $installDir
	RETURN OK 
}

function activate() {
	ENTRY
	INFO "activating [$installDir] in apache httpd host dir [$liveHostDir]"
	sudo mkdir --parents $liveHostDir
	# create directory symbolic link
	sudo ln -s $installDir/* $liveHostDir
	RETURN OK 
}

function stopService() {
	ENTRY
	INFO "STOP build-status service"
	procFound=$(ps aux | grep [p]roxy.js | wc --lines)
	# only run kill if we find no more than 3 processes
	if [[ "$procFound" -le "3" ]] && [[ "$procFound" -gt "0" ]]
	then
		pids=$(ps aux | grep [p]roxy.js | awk '{print $2}')
		INFO "Killing Pids: [$pids]"
		sudo kill $pids
	else
		INFO "Service was already stopped OR more than three (3) processes with the name 'proxy.js' where found!"
	fi
	RETURN OK 
}

function startService() {
	ENTRY
	INFO "START build-status service"
	# running with root privileges and environment, because user account did not allow intallation of required nodejs packages...
	# run the nodeJS service script with appropriate log and error redirects
	# the -i (simulate initial login) option runs the shell specified by the password database entry of the target user as a login shell
	sudo -i node $liveHostDir/server/node-proxy/proxy.js > $installDir/build-status-proxy.log 2> $installDir/build-status-proxy.err &
	# check if this 'job' is running in the background
	INFO "running background jobs: $(jobs -l)"
	# check if our service is still running
	INFO "Check our service process: $(ps aux | grep proxy.js)"
	RETURN OK
}

# run it
update $1 $2

SCRIPTEXIT