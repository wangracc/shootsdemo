const fs = require('fs');
const path = require('path');

const projectConfigFile = path.resolve("./.shoots.json");

module.exports = function() {

    const isPrd = process.env.PRD === "true"
    if (!fs.existsSync(projectConfigFile)) {
        throw Error(projectConfigFile, ".shoots.json 文件没有找到");
    }

    const projectConfigData = fs.readFileSync(projectConfigFile, "utf8");
    const project = JSON.parse(projectConfigData);

    const name = project.Name;
    const mongo = project.Mongo || {};
    const root_url = project.RootUrl;
    let conf = {};
    conf.isPrd = isPrd;
    conf.root_url = root_url;

    let pages = project.Pages;
    conf.pages = {};
    if (pages && pages.length > 0) {
        //找出首页地址,如果没有设置,就用第一页
        for (var i = 0; i < pages.length; i++) {
            let page = pages[i];
            if (page && page.default) {
                conf.defaultPage = page.Name;
            }
            conf.pages[page.Name] = page;
        }

        if (!conf.defaultPage) {
            conf.defaultPage = pages[0].Name;
        }

    }
    return conf;
};
