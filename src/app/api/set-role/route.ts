import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from 'octokit';

const octokit = new Octokit({
  auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
});

export async function POST(req: NextRequest) {
  try {
    const { repo, filePath, title, description, keywords } = await req.json();

    if (!repo || !filePath || !title || !description || !keywords) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [owner, repoName] = repo.split('/');

    console.log('[commit-seo] Inputs:', {
      owner,
      repoName,
      filePath,
    });

    const { data: fileData } = await octokit.rest.repos.getContent({
      owner,
      repo: repoName,
      path: filePath,
      ref: 'main', // ✅ explicitly target the correct branch
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
      repo: repoName,
      path: filePath,
      message: 'Update SEO metadata via HUI',
      content: Buffer.from(updatedHtml).toString('base64'),
      sha: fileData.sha,
      branch: 'main',
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[commit-seo] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
