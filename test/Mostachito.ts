import { expect } from 'chai';
import Mostachito from '../src/Mostachito';
import fs from 'fs';
import path from 'path';
import { hydrationOutputGen, iterableMatchedTemplate, missingPrefixClosingTagIterableMatchedTemplate, mockViewDataWithEmptyErros } from './mockData/expectedHydrationOutput';

describe(`Mostachito`, function() {
  const refs = [
    'siteTitle',
    'nested.child',
    'nonExisting.data',
    'nested.nonExisting',
    'post.attributes.slug',
    'post.attributes.title',
    'post.attributes.nonExisting',
    'post.body',
    'blogUrlPath',
  ];

  let parts = refs[6].split('.');
  parts.shift();
  let ref6WithoutPrefix = parts.join('.');

  const arrayRefs = [
    'posts'
  ];
  const mockTemplate = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>{{ ${refs[0]} }}</title>
        <meta name="description" content="Simplest Blog in Nodejs">
        <meta name="author" content="Guillermo Pages">
        <meta name="nested-child" content="{{ ${refs[1]} }}">
        <link rel="stylesheet" href="css/styles.css?v=1.0">
        <meta name="nested-child" content="{{ ${refs[2]} }}">
        <meta name="nested-child" content="{{ ${refs[3]} }}">
      </head>

      <body>
        <h1>{{ ${refs[0]} }}</h1>
        <ul>
          {{${arrayRefs[0]} as post
          <li><a href="{{ ${refs[8]} }}/{{ ${refs[4]} }}">{{ ${refs[5]} }}</a><p>{{ ${refs[6]} }}</p><p>{{ ${refs[7]} }}</p></li>
          ${arrayRefs[0]}}}
        </ul>
      </body>
    </html>
    `;

  const mockData = {
    siteTitle: 'Guillermo.at',
    title: 'Home',
    nested: { child: 'this is nested' },
    blogUrlPath: '/blog',
    posts: [
      {
        attributes: { title: 'My BlogPost', slug: 'my-blog-post' },
        body: '<p>Ain&#39;t it amazing?</p>\n<h2 id="code">Code</h2>\n<p>Look I can eve',
        frontmatter: 'title: My BlogPost'
      },
      {
        attributes: { title: 'My Other Blog Post', slug: 'my-other-blog-post' },
        body: '<p>Quite amazing indeed!</p>\n<h2 id="code">Code</h2>\n<p>Look I can eve',
        frontmatter: 'title: My Other Blog Post'
      },
    ],
  };

  const mockDataEmptyPostsArray = {
    siteTitle: 'Guillermo.at',
    title: 'Home',
    nested: { child: 'this is nested' },
    blogUrlPath: '/blog',
    posts: [],
  };

  const mockDataMissingPostsAttribute = {
    siteTitle: 'Guillermo.at',
    title: 'Home',
    nested: { child: 'this is nested' },
    blogUrlPath: '/blog',
  };

  const mockArrayRemoved = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>{{ ${refs[0]} }}</title>
        <meta name="description" content="Simplest Blog in Nodejs">
        <meta name="author" content="Guillermo Pages">
        <meta name="nested-child" content="{{ ${refs[1]} }}">
        <link rel="stylesheet" href="css/styles.css?v=1.0">
        <meta name="nested-child" content="{{ ${refs[2]} }}">
        <meta name="nested-child" content="{{ ${refs[3]} }}">
      </head>

      <body>
        <h1>{{ ${refs[0]} }}</h1>
        <ul>
          
        </ul>
      </body>
    </html>
    `;
  const mockArrayReplaced = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>{{ ${refs[0]} }}</title>
        <meta name="description" content="Simplest Blog in Nodejs">
        <meta name="author" content="Guillermo Pages">
        <meta name="nested-child" content="{{ ${refs[1]} }}">
        <link rel="stylesheet" href="css/styles.css?v=1.0">
        <meta name="nested-child" content="{{ ${refs[2]} }}">
        <meta name="nested-child" content="{{ ${refs[3]} }}">
      </head>

      <body>
        <h1>{{ ${refs[0]} }}</h1>
        <ul>
          
          <li><a href="${mockData.blogUrlPath}/${mockData.posts[0].attributes.slug}">${mockData.posts[0].attributes.title}</a><p>${ref6WithoutPrefix}</p><p>${mockData.posts[0].body}</p></li>
          
          <li><a href="${mockData.blogUrlPath}/${mockData.posts[1].attributes.slug}">${mockData.posts[1].attributes.title}</a><p>${ref6WithoutPrefix}</p><p>${mockData.posts[1].body}</p></li>
          
        </ul>
      </body>
    </html>
    `;

  const mockWholeReplaced = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>${mockData.siteTitle}</title>
        <meta name="description" content="Simplest Blog in Nodejs">
        <meta name="author" content="Guillermo Pages">
        <meta name="nested-child" content="${mockData.nested.child}">
        <link rel="stylesheet" href="css/styles.css?v=1.0">
        <meta name="nested-child" content="${refs[2]}">
        <meta name="nested-child" content="${refs[3]}">
      </head>

      <body>
        <h1>${mockData.siteTitle}</h1>
        <ul>
          
          <li><a href="${mockData.blogUrlPath}/${mockData.posts[0].attributes.slug}">${mockData.posts[0].attributes.title}</a><p>${ref6WithoutPrefix}</p><p>${mockData.posts[0].body}</p></li>
          
          <li><a href="${mockData.blogUrlPath}/${mockData.posts[1].attributes.slug}">${mockData.posts[1].attributes.title}</a><p>${ref6WithoutPrefix}</p><p>${mockData.posts[1].body}</p></li>
          
        </ul>
      </body>
    </html>
    `;

  const te = new Mostachito();
  const teWithCallback = new Mostachito(ref => ref);

  describe(`getRefList(template)`, function() {
    it('should return a list of all references in the template', function() {
      expect(te.getRefList(mockTemplate)).to.be.an('array');
    });
    it('should return same amount of unique references in the template', function() {
      expect(te.getRefList(mockTemplate).length).to.be.equal(refs.length);
    });
    it('should return a list of all unique simple references in the template', function() {
      expect(te.getRefList(mockTemplate).sort()).to.be.eql(refs.sort());
    });
  });

  describe(`replaceRef(template, data, ref)`, function() {
    it('should replace all such references', function() {
      expect(te.replaceRef(mockTemplate, mockData, 'nested.child'))
        .to.be.equal(mockTemplate.replace('{{ nested.child }}', mockData['nested']['child']));
    });
  });

  describe(`replaceArray(template, data)`, function() {
    it('should throw if missing data ref using ref without element prefix', function() {
      expect(() => te.replaceArray(mockTemplate, mockData)).to.throw('Template references a data which is missing in the view, ref: ' + ref6WithoutPrefix);
    });
    it('should throw if missing outer ref', function() {
      expect(() => te.replaceArray(mockTemplate, mockDataMissingPostsAttribute)).to.throw(`Template references a data which is missing in the view, ref: ${arrayRefs[0]}`);
    });
    it('should remove the array block when array ref is an empty array', function() {
      expect(te.replaceArray(mockTemplate, mockDataEmptyPostsArray)).to.be.equal(mockArrayRemoved);
    });
    it('should replace all non missing refs with proper data and missing with ones callback output', function() {
      expect(teWithCallback.replaceArray(mockTemplate, mockData)).to.be.equal(mockArrayReplaced);
    });
  });

  describe(`hydrate(template, data)`, function() {
    it('should replace all non missing refs with proper data, even global within nested, and missing with ones callback output', function() {
      expect(teWithCallback.hydrate(mockTemplate, mockData)).to.be.equal(mockWholeReplaced);
    });
  });

  describe(`hydrate(template, data)`, function() {
    const templatePath = path.normalize(path.join(__dirname, `../../test/mockData/status.html`));
    const loadViewTemplate = function (filepath: string): Promise<{ viewTemplate: string; }> {
      return new Promise<{ viewTemplate: string; }>(function(resolve, reject) {
        fs.readFile(filepath, 'utf-8', function(err, viewTemplate) {
          if (err) return reject(err);
          resolve({ viewTemplate });
        });
      });
    }
    it('should have a "viewTemplate" property', async function () {
      const { viewTemplate } = await loadViewTemplate(templatePath);
      expect(teWithCallback.hydrate(viewTemplate, mockViewDataWithEmptyErros)).to.be.equal(hydrationOutputGen(mockViewDataWithEmptyErros));
    });
  });

  describe(`matchIterableTemplate(template)`, function() {
    const templatePath = path.normalize(path.join(__dirname, `../../test/mockData/status.html`));
    const loadViewTemplate = function (filepath: string): Promise<{ viewTemplate: string; }> {
      return new Promise<{ viewTemplate: string; }>(function(resolve, reject) {
        fs.readFile(filepath, 'utf-8', function(err, viewTemplate) {
          if (err) return reject(err);
          resolve({ viewTemplate });
        });
      });
    }
    it('should match the block on its own', async function () {
      expect(teWithCallback.matchIterableTemplate(iterableMatchedTemplate)).to.haveOwnProperty("elsBlockTemplate");
    });
    it('should match something', async function () {
      const { viewTemplate } = await loadViewTemplate(templatePath);
      expect(teWithCallback.matchIterableTemplate(viewTemplate)).to.not.equal(null);
    });

  });

  describe(`debugTemplate(template)`, function() {
    it('should return null when the passed template is ok', async function () {
      expect(teWithCallback.debugTemplate(iterableMatchedTemplate)).to.equal(null);
    });
    it('should return an error when the block matches if we ommit the closing tag name', async function () {
      expect(teWithCallback.debugTemplate(missingPrefixClosingTagIterableMatchedTemplate)).to.be.an.instanceOf(Error);
    });
    it('should return an error with message, when the block matches if we ommit the closing tag name', async function () {
      expect(teWithCallback.debugTemplate(missingPrefixClosingTagIterableMatchedTemplate)?.message).to.be.equal('You seem to be using an iterable template, but missing the proper closing bracket name: are you missing thie <something> part as in <something>.mylist}}?');
    });
  });
});
