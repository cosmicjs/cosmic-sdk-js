module.exports = {
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x',
    'main',
    'beta',
    {
      name: '*-prerelease',
      prerelease: true,
    },
  ],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
      },
    ],
    [
      '@semantic-release/npm',
      {
        tarballDir: 'tar',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: [
          {
            name: 'package.tgz',
            path: 'tar/*.tgz',
          },
          {
            name: 'CHANGELOG.md',
            path: 'CHANGELOG.md',
          },
          {
            name: 'README.md',
            path: 'README.md',
          },
        ],
      },
    ],
  ],
};
