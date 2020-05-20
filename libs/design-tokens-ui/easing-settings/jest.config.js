module.exports = {
  name: 'design-tokens-ui-easing-settings',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/design-tokens-ui/easing-settings',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js',
  ],
};
