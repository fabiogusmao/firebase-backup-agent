var fs = require('fs');
var path = require('path');

var admin = require('firebase-admin');


var S3Device = require('./s3');
var FileSysDevice = require('./filesys');

const FB_CONFIG_FILE = "config.json";

var globalConfig = null;

var device;

console.log("### Firebase Backupp Agent ###");

function loadConfig() {

    try {
        fs.accessSync(FB_CONFIG_FILE, fs.F_OK);
    } catch (e) {
        console.log("The configuration file '" + FB_CONFIG_FILE + "' has not been created yet! See README file for instructions.");
        process.exit(-1);
    }


    console.log("Loading configuration from '" + FB_CONFIG_FILE + "'...");
    globalConfig = JSON.parse(fs.readFileSync(FB_CONFIG_FILE, 'utf8'));
    console.log("Configuration loaded!");

    switch (globalConfig.dest.type) {
        case "filesys": device = new FileSysDevice(globalConfig.dest); break;
        case "s3": device = new S3Device(globalConfig.dest); break;
        default: console.log("Unsupported destination type"); exit(-1);
    }
}


function getLatestVersion(success, failure) {

    var db = admin.database();

    var ref = db.ref('/');

    ref.once('value', function (snapshot) {
        var json = JSON.stringify(snapshot.val());
        success(json);
    });
}


function loadSnapshot(tag, success, error) {
    device.getSnapshot(tag, success, error);
}

function compareWithLatesst(json, success, error) {
    loadSnapshot('latest', function (latest) {
        if (latest === false) {
            success(false);
            return;
        }
        var equal = json === latest;
        if (equal) {
            console.log("No changes!");
        } else {
            "JSON changed!";
        }
        success(equal);
    }, error);
}

function saveSnapshot(json, tag, success, error) {
    device.saveSnapshot(json, tag, success, error);
}

function createTimestampTag() {
    var d = new Date;
    var tag = d.toISOString();
    tag = tag.replace(/(([\:-])|(\..*$))/g, '');
    return tag;
}

function main() {

    loadConfig();

    var admin = require("firebase-admin");

    var serviceAccount = require(globalConfig.firebase.credentialsFile);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: globalConfig.firebase.databaseURL
    });

    getLatestVersion(function (json) {

        compareWithLatesst(json, function (equal) {
            if (!equal) {
                var tag = createTimestampTag();
                saveSnapshot(json, tag, function () {
                    saveSnapshot(json, 'latest', function () {
                        console.log('Complete!');
                        process.exit(0);
                    });
                });
            }else{
                process.exit(0);
            }
        });
    });
}
main();