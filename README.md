# nx based monorepo setup diary

describes a lot of how you set up a nx monorepo to manage and build your code and then use vercel to host - you're also using vite as a bundler which is key to your virtual directory strategy as configured via rewrites in vercel.json. it's a lot so read on.

## setup the monorepo
init the monorepo named naterepo, set it up for typical typescript development
```
npx create-nx-workspace@latest naterepo --preset=web-components --nx-cloud
```
make sure vercel CLI is installed:
```
npm install -g vercel
```

## setup three.js related libraries

install three and lil-gui as we're using them - save them to the package.json, so they can be rebuilt on vercel (hosting). we're setting these up at the repo root so they're available for all
```
npm -i three --save-dev
npm -i lil-gui --save dev
```

## setup tailwindCSS
to get the tailwind generator you need the react plugin
```
npm install -d @nx/react
```

### for each app that wants tailwind css...

and then install tailwind on apps this way:
```
nx g @nx/react:setup-tailwind --project=<your app here>

// e.g. for the metallic app

nx g @nx/react:setup-tailwind --project=metallic
```
one fine tuned point - if you want to have `index.html` in the root be able to use `tailwindcss` then you'll need to change the `glob` the content array is looking for
```
  content: [
    join(__dirname, 'index.html'), // Include the index.html at the root
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
```
the extra join gets you to `index.html` in the root dir - probably there's a better way to do it

### advanced tailwind sharing across apps
if you want to share something advanced such as typography or something else across all apps that's not just built in, [see this](https://blog.nrwl.io/setup-next-js-to-use-tailwind-with-nx-849b7e21d8d0#9dab) article where it talks about using tailwind presets and setting up a file at the root that all tailwind configs can point at

## three-js journey tutorial lessons
to add a lesson from three-js journey, init an app (my first was named metallic) - using vite, created in an apps directory, no e2e tests (yet), don't ask me questions about how the projectNameAndRootFormat are derived - i want it to be named metallic and live under the apps directory. Use jest (for the time being).
```
nx generate @nx/web:application --name=metallic --bundler=vite --directory=apps --e2eTestRunner=none --projectNameAndRootFormat=derived --unitTestRunner=jest
```
generally i delete the generated `babelrc` file as I'm defaulting `swc` compiler and not yet using `babel`

After that copy in the files
- copy the `index.html` from the src folder in the lesson to the `index.html` at the root of your web application folder - be sure to update it to point at the `src/script.js` and `src/style.css `
- copy the `script.js` and the `style.css` to the src folder created in your web application folder
- for now you can get rid of the template `.ts` items and folders created by `nx` - maybe you'll use them in other things you're trying
- copy folders under `static` into `public` folder
- make sure to load resources with `./` rather than `/` as you'll be bypassing the `publicDir` mechanism used in the tutorial and just explicitly dropping them into public from the nx scaffolding 
- delete the favicon.ico created by nx so you can inherit form landing app

update root level vercel.json file with rewrites to the app you added (examples). please note that the landing has to be last or it will consume any rewrites intended for the others. i.e., if you put it first and go to /metallic then it will take anything prefixed with /metallic and send it to the landing destination.  don't do that.
```
{
  "rewrites": [
    {"source": "/metallic/(.*)", "destination": "/apps/metallic/$1"},
    {"source": "/3dtext/(.*)", "destination": "/apps/three-d-text/$1"},
    {"source": "/(.*)", "destination": "/apps/landing/$1"}
  ]
}

```
update the webapp vite.config.js so that it has a base corresponding to the source that you want it to appear at vai the rewrite

```
  export default defineConfig({
  ...
  base: '/metallic/',
  ...
  });
```

finally, don't forget that if you want tailwind.css you'll need to apply it as described above in the tailwind section. don't forget that the three-journey.js lessons are using style.css not styles.css where the tailwind setup wants it to be.  it will warn you that it didn't add imports so you'll need to edit style.css to match the other style.css if you want tailwind support at the top

the defaults for tailwind seem to take care of setting the right border width so things look okay so far - play around with this more to verify

## vercel
you created a project in vercel and associated it with the git repo `naterepo` which is this monorepo. this way every push to github results in a deployment on vercel

you created a build command in the vercel dashboard for the naterepo project by going into settings for the project and providing this override build command

```
nx run-many --all --target=build
```

also - you bought [natepiano.art](https://natepiano.art)  from vercel, i believe it's on autorenew. you've associated that domain with this monorepo so when it builds and you go there, you'll get the landing app and can also jump to metallic or 3dtext (for now)

## nx cloud
you removed the accessToken from `nx.json` and created an `nx-cloud.env` file with it that you put into `.gitignore` so that it wouldn't propagate to github

you then went into vercel `naterepo` project in vercel and created an environment variable named `NX_CLOUD_ACCESS_TOKEN` and pasted the value there so that it would be available when vercel gets notified of a github push and starts a deployment that calls nx-cloud

nx-cloud will only build things that have changed which should speed things up in the future

you also had to go into nx-cloud and associate the access token with the workspace in nx-cloud so you also use their dashboard tools to track activity
