import { peelOnionUsingDotRef } from "./utils/peelOnion";

class Mostachito {
  private missingRefCallback: MissingRefCallback;

  constructor(missingRefCallback?: MissingRefCallback) {
    this.missingRefCallback = missingRefCallback || function(ref: string) {
      throw new TypeError('Template references a data which is missing in the view, ref: ' + ref);
    };
  }

  hydrate(viewTemplate: string, viewData: ViewData) {
    viewTemplate = this.replaceArray(viewTemplate, viewData);
    return this.replace(viewTemplate, viewData);
  }

  getRefList(viewTemplate: string) {
    const surroundingLen = '{{ '.length;
    const unsurroundedRefs = viewTemplate.match(new RegExp('{{ \\w+(?:\\.\\w+)* }}', 'gs'))?.map(surroundedRef => {
      return surroundedRef.substring(surroundingLen, surroundedRef.length-surroundingLen)
    });
    return (unsurroundedRefs && [...new Set(unsurroundedRefs)]) || [];
  }

  replaceRef(viewTemplate: string, viewData: ViewData, ref: string) {
    return viewTemplate.replace(
      new RegExp(`{{ ${ref} }}`, 'g'),
      peelOnionUsingDotRef(viewData, ref, this.missingRefCallback)
    );
  }

  replace(viewTemplate: string, viewData: ViewData) {
    return this.getRefList(viewTemplate)
      .reduce((p, ref) => this.replaceRef(p, viewData, ref), viewTemplate);
  }

  matchIterableTemplate(viewTemplate: string) {
    const elsBlockTemplateRegex = new RegExp('{{(\\w+(?:\\.\\w+)*) as (\\w+)(.+)\\1}}', 'sg');
    const match = elsBlockTemplateRegex.exec(viewTemplate);
    if (!match) {
      return null;
    }
    const elsBlockTemplate = match[0];
    const elsListRefName = match[1];
    const elRefName = match[2];
    const elTemplate = match[3];
    return {
      elsBlockTemplate,
      elsListRefName,
      elRefName,
      elTemplate
    };
  }

  debugTemplate(viewTemplate: string) {
    const normal = this.matchIterableTemplate(viewTemplate);
    if (normal) {
      return null;
    }
    const elsBlockTemplateRegex = new RegExp('{{(\\w+(?:\\.\\w+)*) as (\\w+)(.+)}}', 'sg');
    const match = elsBlockTemplateRegex.exec(viewTemplate);
    if (!match) {
      return null;
    }
    return new Error('You seem to be using an iterable template, but missing the proper closing bracket name: are you missing thie <something> part as in <something>.mylist}}?');
  }

  replaceArray(viewTemplate: string, viewData: ViewData) {
    const match = this.matchIterableTemplate(viewTemplate);
    if (!match) {
      return viewTemplate;
    }
    const {
      elsBlockTemplate,
      elsListRefName,
      elRefName,
      elTemplate
    } = match;

    const elsData = peelOnionUsingDotRef(viewData, elsListRefName, this.missingRefCallback)
    if (Array.isArray(elsData) && elsData.length <= 0) {
      return viewTemplate.replace(new RegExp(elsBlockTemplate, 'g'), '');
    }
    const unprefixedElTemplate = elTemplate.replace(new RegExp(`{{ ${elRefName}\\.`, 'g'), '{{ ');
    const elsHydratedViewPart = elsData.map((elData: ViewData) => {
      const elMakeUnenumerablePropsEnumerable = (typeof elData === 'object' && Object.keys(elData).length <= 0) ? Object.getOwnPropertyNames(elData).reduce((p, c) => ({ ...p, [c]: elData[c]}), {}) : elData;
        return this.replace(unprefixedElTemplate, { ...elMakeUnenumerablePropsEnumerable, ...viewData });
      })
      .join('');

    return viewTemplate.replace(
      new RegExp(elsBlockTemplate, 'g'),
      elsHydratedViewPart
    );
  }

}

export default Mostachito;
