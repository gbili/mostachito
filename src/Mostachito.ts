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

  replaceArray(viewTemplate: string, viewData: ViewData) {
    const r = new RegExp('{{(\\w+(?:\\.\\w+)*) as (\\w+)(.+)\\1}}', 'sg');
    const match = r.exec(viewTemplate);
    if (!match) {
      return viewTemplate;
    }
    const tpl = match[0];
    const outerRef = match[1];
    const subDatas = peelOnionUsingDotRef(viewData, outerRef, this.missingRefCallback)
    if (Array.isArray(subDatas) && subDatas.length <= 0) {
      return viewTemplate.replace(new RegExp(tpl, 'g'), '');
    }
    const innerRef = match[2];
    const subTpl = match[3];
    const subTplWithoutInnerRefPrefix = subTpl.replace(new RegExp(`{{ ${innerRef}\\.`, 'g'), '{{ ');
    const hydratedViewPart = subDatas.map((subData: ViewData) => {
      return this.replace(subTplWithoutInnerRefPrefix, {...subData, ...viewData });
    }).join('');

    return viewTemplate.replace(
      new RegExp(tpl, 'g'),
      hydratedViewPart
    );
  }

}

export default Mostachito;
