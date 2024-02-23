import {
	OMDB_API_KEY
} from '$env/static/private';
import {
	json
} from '@sveltejs/kit';
 

import * as cheerio from 'cheerio';


export async function GET({
	request
}: {
	request: any
}) {
	let tm1=new Date().getTime();
	// const {
	// 	title
	// } = await request.json();
	const rurl = new URL(request.url);
	const title = rurl.searchParams.get("title");
	// const url = `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${title}`;

	// const res = await fetch(url);
	// const details = await res.json();
	// return json(details);
	//   let title="A计划"
	let info = {
		"Title": "",
		"Year": "未设置",
		"Rated": "未获取",
		"Released": "未设置",
		"Runtime": "未设置",
		"Genre": "未设置",
		"Director": "无",
		"Writer": "无",
		"Actors": "无",
		"Plot": "无",
		"Language": "无",
		"Country": "无",
		"Awards": "无",
		"Poster": "",
		"Ratings": [{
			"Source": "无",
			"Value": ""
		}],
		"Metascore": "无",
		"imdbRating": "无",
		"imdbVotes": "无",
		"imdbID": "无",
		"Type": "无",
		"DVD": "无",
		"BoxOffice": "无",
		"Production": "无",
		"Website": "无",
		"Response": "True",
		"PlayURL":"#"
	};

	let headers = new Headers({
		"User-Agent": 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
		'Referer': 'm.douban.com',
		"Accept-Encoding":"gzip, deflate, br",
	});

	let pc_headers = new Headers({
		"User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
		'Referer': 'm.douban.com',
		"Accept-Encoding":"gzip, deflate, br",
	});

	let url = `https://m.douban.com/search/?query=${title}`;
	const res = await fetch(url, {
			method: 'GET',
			headers: headers
		}
		);
	const lists = await res.text();

	// const cheerio = require("cheerio");
 
	let $ = cheerio.load(lists);
	let tm2=new Date().getTime();
	console.log("查询耗时" + (tm2-tm1))
	const modules_rs = $(".search-results").children();
	for (const item of modules_rs) {
		const category = $(item).find(".search-results-modules-name").text();
		if (category == "电影" || category == "电视剧") {
			let rs = $($(item).find(".search_results_subjects")[0]).children();

			let image = $(rs[0]).find('img')[0].attribs["src"]

			image= "/api/images?url="+image.slice(8)
			console.log(image)
			info.Poster = image;
			let detail_url = $(rs[0]).find('a')[0].attribs["href"];

			let id = detail_url.slice(detail_url.lastIndexOf('subject/')+8,-1)
			detail_url = `https://www.douban.com${detail_url}`;

			//    var cheerio = require('cheerio');
			// detail_url = "https://m.douban.com/movie/subject/4811774/";
			console.log(detail_url)

			// const res_detail = await fetch(detail_url, {
			// 	method: 'GET',
			// 	headers: headers
			// });

			// let tm_fetch_detail=new Date().getTime();
			// console.log("tm_fetch_detail" + (tm_fetch_detail-tm2))
			 
			// console.log(id)
			// let actor_url = `https://m.douban.com/rexxar/api/v2/movie/${id}/credits`;
			// console.log(actor_url)

			// const res_actors = await fetch(actor_url, {
			// 	method: 'GET',
			// 	headers: headers
			// });

			// detail_url = "https://m.douban.com/movie/subject/4811774/";
			console.log(detail_url)
	
			const pc_res_detail = await fetch(detail_url, {
				method: 'GET',
				headers: pc_headers
			});
	
			// var cheerio = require('cheerio');
			
			// const details = await res_detail.text();

			// let $detail = cheerio.load(details);
			let tm3=new Date().getTime();
			console.log("查询详情耗时" + (tm3-tm2))
			// const intro = $detail(".subject-intro .bd p").text()
			// console.log(intro)
			// info.Plot = intro

			// info.Ratings[0].Value = $detail("head > meta[itemprop='ratingValue']").attr("content")
			// info.Rated="豆瓣："+$detail("head > meta[itemprop='ratingValue']").attr("content");
			// info.Title = $detail(".sub-title").text()

			
			// console.log(info.Title)

			// const actors_json = await res_actors.json();
			// actors_json.items

			// let directors = [];
			// let actors = []
			// let writers = []
			// for (const person of actors_json.items) {
			// 	if (person.category == "导演") {
			// 		directors.push(person.name);
			// 	}
			// 	if (person.category == "演员") {
			// 		actors.push(person.name);
			// 	}
			// 	if (person.category == "编剧") {
			// 		writers.push(person.name);
			// 	}


			// }


			const pc_details = await pc_res_detail.text();
			console.log(pc_details)
			let $pc = cheerio.load(pc_details);
			let tm4=new Date().getTime();
			console.log("查询演员信息耗时" + (tm4-tm3))
	 
			info.Title=$pc("span[property='v:itemreviewed']")[0].children[0].data
			info.Plot = $pc( $pc("span[property='v:summary']")[0]).html();
			if( $pc('a[data-cn="爱奇艺视频"]')){
				const url = $pc('a[data-cn="爱奇艺视频"]').attr('href');
				if(url){
					// 创建URL对象
					const parsedUrl = new URL(url);

					// 获取url参数的值
					const urlParam = parsedUrl.searchParams.get('url');

					// 解码url参数的值
					info.PlayURL = decodeURIComponent(urlParam);
			}
			
			}
			info.Year= $pc('span[class=year]')[0].children[0].data;
			if($pc("strong[property='v:average']")[0].children[0])
				info.Rated="豆瓣："+ $pc("strong[property='v:average']")[0].children[0].data
			let actorsMeta=$pc("head > meta[property='video:actor']");
			let directorsMeta=$pc("head > meta[property='video:director']");
			//let writersMeta=$pc("head > meta[property='video:director']");
			let directors = [];
			let actors = []
			let writers = [""]
			
			if(actorsMeta){
				for(var ai=0;  ai<actorsMeta.length && ai<5;ai++){
					actors.push(actorsMeta[ai].attribs["content"])
				}
			}
			if(directorsMeta){
				for(var   di=0;di<directorsMeta.length && di<5;di++){
					directors.push(directorsMeta[di].attribs["content"])
				}
			}
	

			info.Director = directors.join(",");
			info.Actors = actors.join(",");
			info.Writer = writers.join(",");









 








		}
	}
	return json(info);

}