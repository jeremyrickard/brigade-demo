const { events, Job, Group } = require("brigadier")


function reporter(project, commit, state,description) {
	var reporter = new Job("reporter", "technosophos/github-notify:latest");
	reporter.env = {
                GH_REPO: project.repo.name,
                GH_STATE: "success",
                GH_DESCRIPTION: "build successful",
                GH_CONTEXT: "brigade",
                GH_TOKEN: project.secrets.githubToken, // YOU MUST SET THIS IN YOUR PROJECT
                GH_COMMIT: commit

        }
	return reporter
}

events.on("pull_request", (event,project) => {
        console.log("Handling a pull request for :" + event.commit)
        var testJob = new Job("test", "java")
        testJob.tasks = [
        "cd /src",
        "./gradlew clean build",
        ]

        testJob.run().then(results => {
		reporter(project, event.commit, "success", "build successful").run()
        }, error => {
		reporter(project, event.commit, "failure", "build failed").run().then(
			() -> {  throw 'Build Failed' })
	})
})

