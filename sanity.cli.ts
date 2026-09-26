import {defineCliConfig} from 'sanity/cli'
export default defineCliConfig({
  api: {
    projectId: '9m8pdh3h',
    dataset: 'production'
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
})
