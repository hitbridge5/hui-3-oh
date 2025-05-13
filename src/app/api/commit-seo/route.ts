import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from 'octokit';

const octokit = new Octokit({
  auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
});

export async function POST(req: NextRequest) {
  try {
    const owner = 'hitbridge5';
    const repo = 'client-electrician-site';
    const path = 'index.html';
    const branch = 'main';

    const { title, description, keywords } = await req.json();

    if (!title || !description || !keywords) {
      return NextResponse.json({ error: 'Missing SEO fields' }, { status: 400 });
    }

    // Confirm token is working
    const authTest = await octokit.rest.users.getAuthenticated();
    console.log('[auth] GitHub user:', authTest.data.login);

    // Get existing file content
    const { data: fileData } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    const html = Buffer.from(
      typeof fileData.content === 'string' ? fileData.content : '',
      'base64'
    ).toString('utf8');

    const newHead = `
      <title>${title}</title>
      <meta name="description" content="${description}">
      <meta name="keywords" content="${keywords.join(', ')}">
    `.trim();

    const updatedHtml = html.replace(
      /<head>([\s\S]*?)<\/head>/i,
      `<head>\n${newHead}\n</head>`
    );

    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: 'Update SEO metadata via HUI',
      content: Buffer.from(updatedHtml).toString('base64'),
      sha: fileData.sha,
      branch,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[commit-seo] ERROR:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
