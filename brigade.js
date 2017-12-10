const { events, Job, Group } = require("brigadier")


events.on("pull_request", (event,project) => {
        console.log("Handling a pull request for :" + event.commit)
        var testJob = new Job("test", "java")
        testJob.tasks = [
        "cd /src",
        "./gradlew clean build",
        ]

        var reporter = new Job("reporter", "technosophos/github-notify:latest");
        reporter.env = {
                GH_REPO: project.repo.name,
                GH_STATE: "success",
                GH_DESCRIPTION: "brigade says YES!",
                GH_CONTEXT: "brigade",

                // We get the token from the project's secrets section.
                GH_TOKEN: project.secrets.githubToken, // YOU MUST SET THIS IN YOUR PROJECT

                // We set this because 'exec' doesn't have a real commit. Normally you
                // would use e.commit.
                GH_COMMIT: event.commit

        }

        var group = new Group()
        group.add(testJob)
        group.add(reporter)
        console.log("before")


        testJob.run().then(results => {
                console.log("good")
		reporter.run()
        }).catch(error => {
		console.log(error)
		reporter.env = {
               		GH_REPO: project.repo.name,
                	GH_STATE: "failure",
                	GH_DESCRIPTION: "build failed",
                	GH_CONTEXT: "brigade",

                	// We get the token from the project's secrets section.
                	GH_TOKEN: project.secrets.githubToken, // YOU MUST SET THIS IN YOUR PROJECT

                	// We set this because 'exec' doesn't have a real commit. Normally you
                	// would use e.commit.
                	GH_COMMIT: event.commit

        	}
		reporter.run().then( () => {
			throw error
		})
        })

})

