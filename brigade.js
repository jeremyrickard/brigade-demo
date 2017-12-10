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
                GH_DESCRIPTION: "build successful",
                GH_CONTEXT: "brigade",
                GH_TOKEN: project.secrets.githubToken, // YOU MUST SET THIS IN YOUR PROJECT
                GH_COMMIT: event.commit

        }

        testJob.run().then(results => {
		reporter.run()
        }).catch(error => {
		reporter.env = {
               		GH_REPO: project.repo.name,
                	GH_STATE: "failure",
                	GH_DESCRIPTION: "build failed",
                	GH_CONTEXT: "brigade",
                	GH_TOKEN: project.secrets.githubToken, // YOU MUST SET THIS IN YOUR PROJECT
                	GH_COMMIT: event.commit
        	}
		reporter.run().then( () => {
			throw error
		})
        })

})

