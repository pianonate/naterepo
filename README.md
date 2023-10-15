# nx based monorepo setup diary

describes a lot of how you set up a nx monorepo to manage and build your code and then use vercel to host - you're also using vite as a bundler which is key to your virtual directory strategy as configured via rewrites in vercel.json. it's a lot so read on.

## setup the monorepo
init the monorepo named natepiano, set it up for typical typescript development
```
npx create-nx-workspace@latest natepiano --preset=web-components --nx-cloud
```
make sure vercel CLI is installed:
```
npm install -g vercel
```

install three and lil-gui as we're using them - save them to the package.json, so they can be rebuilt on vercel (hosting). we're setting these up at the repo root so they're available for all
```
npm -i three --save-dev
npm -i lil-gui --save dev
```


## three-js journey tutorial lessons
to add a lesson from three-js journey, init an app (my first was named metallic) - using vite, created in an apps directory, no e2e tests (yet), don't ask me questions about how the projectNameAndRootFormat are derived - i want it to be named metallic and live under the apps directory. Use jest (for the time being).
```
nx generate @nx/web:application --name=metallic --bundler=vite --directory=apps --e2eTestRunner=none --projectNameAndRootFormat=derived --unitTestRunner=jest
```
After that copy in the files
- copy the `index.html` from the src folder in the lesson to the `index.html` at the root of your web application folder - be sure to update it to point at the `src/script.js` and `src/style.css `
- copy the `script.js` and the `style.css` to the src folder created in your web application folder
- for now you can get rid of the template `.ts` items and folders created by `nx` - maybe you'll use them in other things you're trying
- copy folders under `static` into `public` folder
- make sure to load resources with `./` rather than `/` as you'll be bypassing the `publicDir` mechanism used in the tutorial and just explicitly dropping them into public from the nx scaffolding 

update root level verce.json file with rewrites to the webapp (examples)
```
{
  "rewrites": [
    {"source": "/", "destination": "/apps/landing/index.html"},
    {"source": "/metallic/(.*)", "destination": "/apps/metallic/$1"},
    {"source": "/3dtext/(.*)", "destination": "/apps/three-d-text/$1"}
  ]
}

```
update the webapp vite.config.js so that it has a base corresponding to the source that you want it to appear at via the rewrite above

```
  export default defineConfig({
  ...
  base: '/metallic/',
  ...
  });
```

## vercel
you created a project in vercel and associated it with the git repo `naterepo` which is this monorepo. this way every push to github results in a deployment on vercel

you created a build command in the vercel dashboard for the naterepo project by going into settings for the project and providing this override build command

```
nx run-many --all --target=build
```

## nx cloud
you removed the accessToken from `nx.json` and created an `nx-cloud.env` file with it that you put into `.gitignore` so that it wouldn't propagate to github

you then went into vercel `naterepo` project in vercel and created an environment variable named `NX_CLOUD_ACCESS_TOKEN` and pasted the value there so that it would be available when vercel gets notified of a github push and starts a deployment that calls nx-cloud

nx-cloud will only build things that have changed which should speed things up in the future

you also had to go into nx-cloud and associate the access token with the workspace in nx-cloud so you also use their dashboard tools to track activity
