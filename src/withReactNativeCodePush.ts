import {
  type ConfigPlugin,
  AndroidConfig,
  createRunOncePlugin,
  withInfoPlist,
  withAppDelegate,
  withStringsXml,
  withAppBuildGradle,
  withMainApplication,
} from '@expo/config-plugins';
import { addImports } from '@expo/config-plugins/build/android/codeMod';
import { mergeContents } from '@expo/config-plugins/build/utils/generateCode';

interface PluginProps {
  android?: {
    CodePushReleaseChannelPublicId: string;
    CodePushSigningPublicKey?: string;
  };
  ios?: {
    CodePushReleaseChannelPublicId: string;
    CodePushSigningPublicKey?: string;
  };
}

const withIos: ConfigPlugin<PluginProps> = (config, { ios }) => {
  if (!ios) {
    return config;
  }

  config = withInfoPlist(config, (config) => {
    if (!ios.CodePushReleaseChannelPublicId) {
      throw new Error('Missing ios CodePushReleaseChannelPublicId');
    }

    config.modResults.CodePushReleaseChannelPublicId = ios.CodePushReleaseChannelPublicId;

    if (ios.CodePushSigningPublicKey) {
      config.modResults.CodePushSigningPublicKey = ios.CodePushSigningPublicKey;
    }

    return config;
  });

  config = withAppDelegate(config, (config) => {
    const { modResults } = config;
    const { language } = modResults;

    if (language !== 'objc' && language !== 'objcpp') {
      throw new Error(`Cannot modify the project AppDelegate as it's not in a supported language: ${language}`);
    }

    config.modResults.contents = mergeContents({
      src: modResults.contents,
      comment: '//',
      tag: '@appzung/react-native-code-push-header',
      offset: 1,
      anchor: /#import "AppDelegate\.h"/,
      newSrc: '#import <CodePush/CodePush.h>',
    }).contents;

    config.modResults.contents = config.modResults.contents.replace(
      /return \[\[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];/,
      `// @appzung/react-native-code-push-bundle\n  return [CodePush bundleURL];`,
    );

    return config;
  });

  return config;
};

const withAndroid: ConfigPlugin<PluginProps> = (config, { android }) => {
  if (!android) {
    return config;
  }

  config = withStringsXml(config, (config) => {
    if (!android.CodePushReleaseChannelPublicId) {
      throw new Error('Missing android CodePushReleaseChannelPublicId');
    }

    AndroidConfig.Strings.setStringItem(
      [
        {
          $: {
            name: 'CodePushReleaseChannelPublicId',
            translatable: 'false',
          },
          _: android.CodePushReleaseChannelPublicId,
        },
      ],
      config.modResults,
    );

    if (android.CodePushSigningPublicKey) {
      AndroidConfig.Strings.setStringItem(
        [
          {
            $: {
              name: 'CodePushSigningPublicKey',
              translatable: 'false',
            },
            _: android.CodePushSigningPublicKey,
          },
        ],
        config.modResults,
      );
    }

    return config;
  });

  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      throw new Error(`Cannot modify build.gradle if it's not groovy, received: ${config.modResults.language}`);
    }

    if (!config.modResults.contents.includes('@appzung/react-native-code-push-gradle')) {
      config.modResults.contents =
        config.modResults.contents +
        '\n' +
        '// @appzung/react-native-code-push-gradle' +
        '\n' +
        'apply from: "../../node_modules/@appzung/react-native-code-push/android/codepush.gradle"' +
        '\n';
    }

    return config;
  });

  config = withMainApplication(config, (config) => {
    const { modResults } = config;
    const { language } = modResults;

    config.modResults.contents = addImports(
      modResults.contents,
      ['com.appzung.codepush.react.CodePush'],
      language === 'java',
    );

    if (language === 'kt') {
      config.modResults.contents = mergeContents({
        src: modResults.contents,
        comment: '//',
        tag: '@appzung/react-native-code-push-main-application-kt',
        offset: 1,
        anchor: /override fun getUseDeveloperSupport\(\): Boolean = BuildConfig\.DEBUG/,
        newSrc: `          override fun getJSBundleFile(): String {
              return CodePush.getJSBundleFile()
          }`,
      }).contents;

      return config;
    }

    throw new Error(`Cannot modify MainApplication because the language "${language}" is not supported`);
  });

  return config;
};

const withAppZungCodePushPlugin: ConfigPlugin<PluginProps> = (config, props) => {
  config = withIos(config, props);
  config = withAndroid(config, props);
  return config;
};

const pkg = {
  name: '@appzung/react-native-code-push',
  version: 'UNVERSIONED',
};

export default createRunOncePlugin(withAppZungCodePushPlugin, pkg.name, pkg.version);
