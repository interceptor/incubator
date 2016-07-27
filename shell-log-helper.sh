#!/bin/sh

SCRIPT_LOG=$1

touch $SCRIPT_LOG

function SCRIPTENTRY() {
    timeAndDate=`date`
    script_name=`basename "$0"`
	echo "$FUNCNAME: $script_name"
    echo "$FUNCNAME: $script_name" >> $SCRIPT_LOG
}

function SCRIPTEXIT() {
    script_name=`basename "$0"`
	echo "$FUNCNAME: $script_name"
    echo "$FUNCNAME: $script_name" >> $SCRIPT_LOG
}

function ENTRY() {
    local cfn="${FUNCNAME[1]}"
    local tstamp=`date`
    local msg=" *** $cfn $FUNCNAME ***"
	echo -e "[$tstamp] [DEBUG]\t$msg"
    echo -e "[$tstamp] [DEBUG]\t$msg" >> $SCRIPT_LOG
}

function RETURN() {
    local cfn="${FUNCNAME[1]}"
    local tstamp=`date`
    local msg=" $cfn $FUNCNAME --> $1"
	echo -e "[$tstamp] [DEBUG]\t$msg"
    echo -e "[$tstamp] [DEBUG]\t$msg" >> $SCRIPT_LOG
}
function INFO() {
    local msg="$1"
    local tstamp=`date`
	echo -e "[$tstamp] [INFO]\t$msg"
    echo -e "[$tstamp] [INFO]\t$msg" >> $SCRIPT_LOG
}

function ERROR() {
    local msg="$1"
    local tstamp=`date`
	echo -e "[$tstamp] [ERROR]\t$msg"
    echo -e "[$tstamp] [ERROR]\t$msg" >> $SCRIPT_LOG
}

function DEBUG() {
    local msg="$1"
    local tstamp=`date`
	echo -e "[$tstamp] [DEBUG]\t$msg"
    echo -e "[$tstamp] [DEBUG]\t$msg" >> $SCRIPT_LOG
}