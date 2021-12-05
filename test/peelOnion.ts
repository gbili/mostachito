import { expect } from 'chai';
import { peelOnionUsingDotRef } from '../src/utils/peelOnion';

describe(`peelOnion`, function() {

  const mockData = {
    siteTitle: 'Guillermo.at',
    title: 'Home',
    nested: { child: 'this is nested' },
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

  describe(`peelOnionUsingDotRef(data, ref)`, function() {
    it('should access nested.child as data["nested"]["child"]', function() {
      expect(peelOnionUsingDotRef(mockData, 'nested.child')).to.be.equal(mockData.nested.child); // bug in our typings string should be allowed
    });
    it('should access posts.1.attributes.title as data["posts"][1]["attributes"]["title"]', function() {
      expect(peelOnionUsingDotRef(mockData, 'posts.1.attributes.title')).to.be.equal(mockData.posts[1].attributes.title); // bug in our typings string should be allowed
    });
    it('should throw when trying to access non existing first level data', function() {
      const badRef = 'nonExisting.data';
      expect(() => peelOnionUsingDotRef(mockData, badRef)).to.throw(`Missing ref ${badRef}`);
    });
    it('should return missingRefCallbacks return on missing ref when when passed ref => ref as cb,', function() {
      const badRef = 'nonExisting.data';
      expect(peelOnionUsingDotRef(mockData, badRef, ref => ref)).to.be.equal(badRef);
    });
    it('should return missingRefCallbacks return on missing ref when passed ref => ref as cb, on second level bad ref', function() {
      const badRef = 'nested.nonExisting';
      expect(peelOnionUsingDotRef(mockData, badRef, ref => ref)).to.be.equal(badRef);
    });
  });
});
