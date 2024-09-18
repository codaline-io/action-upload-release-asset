jest.mock('@actions/core');
const mockUploadReleaseAsset = jest.fn().mockReturnValue({
  data: {
    browser_download_url: 'browserDownloadUrl'
  }
});
jest.mock('@actions/github', () => ({
  context: {
    repo: {
      owner: 'owner',
      repo: 'repo'
    }
  },
  getOctokit: jest.fn().mockImplementation(() => ({
    request: mockUploadReleaseAsset
  }))
}));
jest.mock('node:fs');

const core = require('@actions/core');
const fs = require('node:fs');
const run = require('../src/upload-release-asset');
/* eslint-disable no-undef */
describe('Upload Release Asset', () => {
  let content;

  beforeEach(() => {
    fs.statSync = jest.fn().mockReturnValueOnce({
      size: 527
    });

    content = Buffer.from('test content');
    fs.readFileSync = jest.fn().mockReturnValueOnce(content);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Upload release asset endpoint is called', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('upload_url')
      .mockReturnValueOnce('asset_path')
      .mockReturnValueOnce('asset_name')
      .mockReturnValueOnce('asset_content_type');

    await run();

    expect(mockUploadReleaseAsset).toHaveBeenCalledWith({
      method: 'POST',
      url: 'upload_url',
      headers: { 'content-type': 'asset_content_type', 'content-length': 527 },
      name: 'asset_name',
      data: content
    });
  });

  test('Output is set', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('upload_url')
      .mockReturnValueOnce('asset_path')
      .mockReturnValueOnce('asset_name')
      .mockReturnValueOnce('asset_content_type');

    core.setOutput = jest.fn();

    await run();

    expect(core.setOutput).toHaveBeenNthCalledWith(2, 'browser_download_url', 'browserDownloadUrl');
  });

  test('Action fails elegantly', async () => {
    core.getInput = jest
      .fn()
      .mockReturnValueOnce('upload_url')
      .mockReturnValueOnce('asset_path')
      .mockReturnValueOnce('asset_name')
      .mockReturnValueOnce('asset_content_type');

    mockUploadReleaseAsset.mockRestore();
    mockUploadReleaseAsset.mockImplementation(() => {
      throw new Error('Error uploading release asset');
    });

    core.setOutput = jest.fn();

    core.setFailed = jest.fn();

    await run();

    expect(mockUploadReleaseAsset).toHaveBeenCalled();
    expect(core.setFailed).toHaveBeenCalledWith('Error uploading release asset');
    expect(core.setOutput).toHaveBeenCalledTimes(0);
  });
});
