const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('node:fs');

async function run() {
  try {
    // Get authenticated GitHub client (Ocktokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
    // const github = new GitHub(process.env.GITHUB_TOKEN);
    const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

    // Get the inputs from the workflow file: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    const uploadUrl = core.getInput('upload_url', { required: true });
    const assetPath = core.getInput('asset_path', { required: true });
    const assetName = core.getInput('asset_name', { required: true });
    const assetContentType = core.getInput('asset_content_type', { required: true });

    // Determine content-length for header to upload asset
    const contentLength = (filePath) => fs.statSync(filePath).size;

    const headers = { 'content-type': assetContentType, 'content-length': contentLength(assetPath) };

    // Upload a release asset
    const uploadAssetResponse = await octokit.rest.repos.uploadReleaseAsset({
      url: uploadUrl,
      headers,
      name: assetName,
      file: fs.readFileSync(assetPath)
    });

    core.info({ uploadAssetResponse });

    // Get the browser_download_url for the uploaded release asset from the response
    const {
      data: { browser_download_url: browserDownloadUrl, url }
    } = uploadAssetResponse;

    core.setOutput('url', url);
    // Set the output variable for use by other actions: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    core.setOutput('browser_download_url', browserDownloadUrl);
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = run;
