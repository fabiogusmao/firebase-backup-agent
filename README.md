# firebase-backup-agent
Yet another Firebase Backupp agent!

Ths Node.js program downloads the latest version of your Firebase JSON  and backs it up in a folder specified by you.

## Installation ##

Clone or download this repository, open a command prompt and type:

	npm install


## Usage ##

Before making backups we need to setup our `config.json` file. This file contains the credentials and database URL we're loading JSON from and information about where the program should save it.

- Create a file named `config.json` in the program's directory and paste the following in it:

	{
		"firebase": {
			"credentialsFile": "./firebase.json",
			"databaseURL": "https://<PROJECT_ID>.firebaseio.com"
		},
		"dest": {
			"type": "filesys",
			"folder": "backups",
			"pattern": "firebase-"			
		}
	}

1) The `<PROJECT_ID>` can be found in your project's console by clicking the `Settings` icon next to `Overview` in the left menu pane.
2) The credentials file can be generated / downloaded by using the `SERVICE ACCOUNTS` tab in the same screen as the previous step and then clicking `Manage all service accounts`. 
	1) Click the dots icon for `firebase-admin-sdk` and choose `Create key`.
	2) Download the file and point its location in the `firebase/credentialsFile` property.
3) You can customize the filenames generated by the program by changing the `pattern` field.

To run this program open a command prompt in this file's folder and type one of the following:

#### To view program options

    node program.js

#### To check for changes / backup database
	node program.js --backup

#### To save the database to a file
	node program.js --get file.json
#### To save the contents of an object of to a file
	node program.js --getnode /some/path/to/node file.json

#### To replace the entire database with contents of a file
	node program.js --set file.json
#### To replace the contents of an object with a file
	node program.js --setnode /some/path/to/be/replaced file.sjon
#### To update the database with the contents of a file
	node program.js --update file.json
#### To update an object with contents of a file
	node program.js --updatenode file.json
### Integrating with Amazon S3

If file system backups is not your thing you can setup the agent to save files to S3 instead. Replace the `dest` portion of you `config.json` with one similar to this:

	"dest": {
        "type": "s3",
        "credentialsFile": "./credentials.json",
        "bucket": "my-bucket",
        "pattern": "firebase-"       
    }

You must also create a file with your AWS keys. This file can be locatged anywhere as long as you point to it in `config.json`. Here is an example of this file's format:

	{
		"accessKeyId": "YOUR ACCESS KEY",
		"secretAccessKey": "IT'S A SECRET",
		"region": "us-west-2"
	}


## Schedulling backups ##

It is recommended that you use this program as a scheduled task in your system so that it checks for changes periodically.

- On Windows you can simply start Task Scheduler and create a new task pointing `run.cmd` as your executable/script. Don't forget to set this file's folder as the working directory.

- On Linux you can put `run.sh`in your system's `crontab`.