import { Application } from 'probot'

import { run_checks } from "./checks";

export = (app: Application) => {
  // Your code here
  app.log('Yay, the app was loaded!')

  app.on(["pull_request.opened", "pull_request.synchronize"], run_checks);
}
