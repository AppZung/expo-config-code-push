# @appzung/expo-config-code-push

Expo Config Plugin to auto-configure [`@appzung/react-native-code-push`](https://github.com/appzung/react-native-code-push) when the native code is generated (`npx expo prebuild`).

## Versioning

Ensure you use versions that work together!

| `expo` | `@appzung/react-native-code-push` | `@appzung/expo-config-code-push` |
| ------ | --------------------------------- | -------------------------------- |
| 52.0.0 | 10+                               | 1.0.0                            |

## Expo installation

> This package cannot be used in the "Expo Go" app because [it requires custom native code](https://docs.expo.io/workflow/customizing/).

1. (optional) If your app doesn't target iOS >= 15.5, add the compatible `deploymentTarget` with [expo-build-properties](https://docs.expo.dev/versions/latest/sdk/build-properties/)

Note that bare React Native apps can use our module with iOS < 15.5. If you need this for your expo app, please contact us at [support@appzung.com](mailto:support@appzung.com).

```sh
npx expo install expo-build-properties
```

```json
{
  "plugins": [
    "...other plugins",
    [
      "expo-build-properties",
      {
        "ios": {
          "deploymentTarget": "15.5"
        }
      }
    ]
  ]
}
```

Then update the deployment target in your native files with `npx expo prebuild`.

2. Install the AppZung CodePush packages with yarn, npm, or [`npx expo install`](https://docs.expo.io/workflow/expo-cli/#expo-install).

```sh
npx expo install @appzung/react-native-code-push @appzung/expo-config-code-push
```

3. Add the [config plugin](https://docs.expo.io/guides/config-plugins/) to the [`plugins`](https://docs.expo.io/versions/latest/config/app/#plugins) array of your `app.json` or `app.config.js`:

```json
{
  "plugins": [
    "...other plugins",
    [
      "@appzung/expo-config-code-push",
      {
        "ios": {
          "CodePushReleaseChannelPublicId": "YOUR_IOS_PUBLIC_ID",
          "CodePushSigningPublicKey": "YOUR_SIGNING_KEY"
        },
        "android": {
          "CodePushReleaseChannelPublicId": "YOUR_ANDROID_PUBLIC_ID",
          "CodePushSigningPublicKey": "YOUR_SIGNING_KEY"
        }
      }
    ]
  ]
}
```

4. Replace `YOUR_ANDROID_PUBLIC_ID` and `YOUR_IOS_PUBLIC_ID` with your public IDs (`$ appzung release-channels list`).

5. Either replace `YOUR_SIGNING_KEY` with your [Code Signing](https://github.com/AppZung/react-native-code-push/blob/main/docs/code-signing.md) key, or remove the `CodePushSigningPublicKey` fields.

6. Rebuild your app as described in the ["Adding custom native code"](https://docs.expo.io/workflow/customizing/) guide.

7. Use AppZung CodePush in your JS code, follow the [docs](https://github.com/AppZung/react-native-code-push#usage).
