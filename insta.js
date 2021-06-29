/**instagram crowler 
 * Ali Smithy
 * 2021 Jun 29
*/
insta = {
    ds_user_id: document.cookie.split("ds_user_id=")[1].split(";")[0],
    cnt: 100,
    mutual: true,
    qhash: {
        followings: { hash: "d04b0a864b4b54837c0d870b0e77e076", edge: "edge_follow", text: "followings" },
        followers: { hash: "c76146de99bb02f6415203be841dd25a", edge: "edge_followed_by", text: "followers" },
        storyviewrs: { hash: "42c6ec100f5e57a1fe09be16cd3a7021", edge: "" },
        storylistandfirstfiftyviewers: { hash: "52a36e788a02a3c612742ed5146f1676", edge: "" }
    },
    addr: function () {
        return `https://www.instagram.com/graphql/query/?query_hash={q}&variables={"id":"${insta.ds_user_id}","include_reel":"true","fetch_mutual":"${insta.mutual}","first":"${insta.cnt}","after":"{after}"}`;
    },
    getList: async function (q, o, c) {
        if (o.count == o.edges.length) {
            // window.alert("fetch completed before");
            return;
        }
        let _addr = insta.addr().replace(/{q}/, q.hash).replace(/{after}/, o.cursor);
        await fetch(_addr)
            .then(res => res.json())
            .then(async d => {
                console.log("d", d);
                o.count = d.data.user[q.edge].count;
                d.data.user[q.edge].edges.forEach(element => {
                    o.edges.push(element);
                });
                let _p = document.getElementById("alinsta_p");
                _p.innerHTML += `<div>fetch ${q.text} ${Math.round(o.edges.length / o.count * 100)}%</div><br/>`;
                if (d.data.user[q.edge].page_info.has_next_page) {
                    o.cursor = d.data.user[q.edge].page_info.end_cursor;
                    await c();
                }
                else {
                    o.cursor = "";
                    console.log("obj", o);
                }
            })
            .catch(err => {
                console.error(err);
                // alert("err");
            });
    },
    followings: { count: -1, edges: [], cursor: "" },
    getFollowings: async function () {
        await insta.getList(insta.qhash.followings, insta.followings, insta.getFollowings);
    },
    followers: { count: -1, edges: [], cursor: "" },
    getFollowers: async function () {
        await insta.getList(insta.qhash.followers, insta.followers, insta.getFollowers);
    },
    getDiff: async function () {
        insta.render();
        await insta.getFollowers();
        await insta.getFollowings();
        // const diff = insta.followings.edges.filter(x => insta.followers.edges.find(y => y.node.id == x.node.id) == undefined);
        document.getElementById("alinsta_p").remove();
        insta.renderResult([], "choose action");
        // console.log("diff", diff);
    },
    render: function () {
        let _panel = document.createElement("div");
        _panel.id = "alinsta";
        _panel.style = 'width: 400px; /*! height: 400px; */ margin: 10px; top: 10px; position: absolute; left: 10px; background-color: rgb(200, 200, 200); border: 1px solid black; opacity: 0.98; display: flex;bottom: 10px;';
        document.body.appendChild(_panel);
        let _panel_header = document.createElement("div");
        _panel_header.id = "alinsta_h";
        _panel_header.innerHTML = "following diff finder";
        _panel_header.style = "text-align: center;padding: 3px;font-weight: bold;";
        _panel.appendChild(_panel_header);
        let _panel_keys = document.createElement("div");
        _panel_keys.style = "display: flex;flex-direction: row;";
        _panel.appendChild(_panel_keys);
        let _close = document.createElement("button");
        _close.innerText = "Close";
        _close.onclick = () => { document.getElementById("alinsta").remove(); };
        _panel_keys.appendChild(_close);
        let _oyf = document.createElement("button");
        _oyf.innerText = "only you follow";
        _oyf.onclick = () => {
            const diff = insta.followings.edges.filter(x => insta.followers.edges.find(y => y.node.id == x.node.id) == undefined);
            insta.renderResult(diff, _oyf.innerText);
        };
        _panel_keys.appendChild(_oyf);
        let _otf = document.createElement("button");
        _otf.innerText = "only they follow";
        _otf.onclick = () => {
            const diff = insta.followers.edges.filter(x => insta.followings.edges.find(y => y.node.id == x.node.id) == undefined);
            insta.renderResult(diff, _otf.innerText);
        };
        _panel_keys.appendChild(_otf);
        let _inner_pannel = document.createElement("div");
        _inner_pannel.id = "alinsta_i";
        _inner_pannel.style = "overflow: auto;position: relative;max-height: 100%;flex-shrink: 1;background-color: whitesmoke;";
        _panel.appendChild(_inner_pannel);
        let _percent_pannel = document.createElement("div");
        _percent_pannel.id = "alinsta_p";
        _inner_pannel.appendChild(_percent_pannel);
    },
    renderResult: function (diff, text) {
        document.getElementById("alinsta_h").innerHTML = text + `; count=${diff.length}`;
        document.getElementById("alinsta_i").innerHTML = "";
        diff.forEach(x => {
            let _e = document.createElement("div");
            _e.style = "flex-direction: row; margin: 2px;"
            _e.innerHTML = `<a style="display: flex;" href="http://www.instagram.com/${x.node.username}"><img style="width:50px;height:50px" src="${x.node.profile_pic_url}"/><span>${x.node.username}</span></a>`;
            document.getElementById("alinsta_i").appendChild(_e);
        });
    }
}
insta.getDiff();
