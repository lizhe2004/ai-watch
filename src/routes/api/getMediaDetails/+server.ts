import {
	OMDB_API_KEY
} from '$env/static/private';
import {
	json
} from '@sveltejs/kit';

import DecryptClass from './decrypt.js';

import * as cheerio from 'cheerio';


export async function GET({
	request
}: {
	request: any
}) {
	
	// const {
	// 	title
	// } = await request.json();
	const rurl = new URL(request.url);
	var title = rurl.searchParams.get("title") ? rurl.searchParams.get("title") : "";
	title = title.replace(/电视剧|电影/g, "");
	// const info = await searchFromMobile(title?title :"")
	const info = await searchFromPC(title?title :"")
	return json({"code":200,"data":info});
}

async function searchFromPC(title:string){
	let pc_headers = new Headers({
		"User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
		'Referer': 'm.douban.com',
		"Accept-Encoding": "gzip, deflate, br",
	});
	var regex = /window.__DATA__ = "([^"]+)"/;
	 
	var titles=[];
	let info =null;
	try {
		const pc_search_url = "https://search.douban.com/movie/subject_search?search_text="+title+"&cat=1002"
		let tm2 = new Date().getTime();
		const response = await fetch(pc_search_url, {
			method: 'GET',
			headers: pc_headers
		});
		const data = await response.text();
		var regex = /window.__DATA__ = "([^"]+)"/;
		const match = data.match(regex);
		console.log(data)
		if (match) {
			console.log('加密的数据:111', match[1]+"数据结束");
			const decrypt = new DecryptClass();
			var records = decrypt.decrypt(match[1])
			console.log(records.payload.items.length)
			for (var i=0;i<records.payload.items.length;i++){
				titles.push(records.payload.items[i].title)
			}
			console.log("titles"+titles.length)
			const matched = getMaxSimilarText(title, titles)
			
			if(matched.length==2){
				var url = records.payload.items[matched[0]].url
				info = await getDetailFromPC(url) 
			}
			console.log("解密后数据"+records)
		  }
	} catch (error) {
		console.log(error);
	}

	return info;
}


async function searchFromMobile(title:string){
	let tm1 = new Date().getTime();
	let headers = new Headers({
		"User-Agent": 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
		'Referer': 'm.douban.com',
		"Accept-Encoding": "gzip, deflate, br",
	});

	let url = `https://m.douban.com/search/?query=${title}&type=1002`;
	const res = await fetch(url, {
		method: 'GET',
		headers: headers
	});
	const lists = await res.text();

	// const cheerio = require("cheerio");

	let $ = cheerio.load(lists);
	let info =null;
	let tm2 = new Date().getTime();
	console.log("查询耗时" + (tm2 - tm1))
	const modules_rs = $(".search-results").children();
	for (const item of modules_rs) {
		const category = $(item).find(".search-results-modules-name").text();
		if (category == "电影" || category == "电视剧") {
			let rs = $($(item).find(".search_results_subjects")[0]).children();
			var titleArray = [];
			for (const itemFilm of $($(item).find(".search_results_subjects")[0]).find('.subject-title')) {
				$(itemFilm).text()
				titleArray.push($(itemFilm).text())
				console.log($(itemFilm).text())
			}
			const matched = getMaxSimilarText(title, titleArray)
			
			let detail_url = $(rs[matched[0]]).find('a')[0].attribs["href"];

			let id = detail_url.slice(detail_url.lastIndexOf('subject/') + 8, -1)
			detail_url = `https://www.douban.com${detail_url}`;

			//    var cheerio = require('cheerio');
			// detail_url = "https://m.douban.com/movie/subject/4811774/";
			console.log(detail_url)
			info = await getDetailFromPC(detail_url) 
		}
	}
	return info;
}
async function getDetailFromPC(pcUrl:string){

	let info = {
		"Title": "",
		"Douban":"",
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
		"PlayURL": "#",
		"channels": []
	};
	let pc_headers = new Headers({
		"User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
		'Referer': 'm.douban.com',
		"Accept-Encoding": "gzip, deflate, br",
	});
	let tm2 = new Date().getTime();
	const pc_res_detail = await fetch(pcUrl, {
		method: 'GET',
		headers: pc_headers
	});

	let tm3 = new Date().getTime();
	console.log("查询详情耗时" + (tm3 - tm2))

	const pc_details = await pc_res_detail.text();
	// console.log(pc_details)
	let $pc = cheerio.load(pc_details);

	const scriptTags = $pc('script');

	var playlists = {}
	var match_result = null;
	info.Douban=pcUrl;
	scriptTags.each((i, el) => {
		const scriptContent = $pc(el).html();

		// 使用正则表达式匹配sources map
		const match = scriptContent.match(/var sources = (.*?);([\s\S]*?)(?=\$\('.playBtn'\)\.each|$)/);

		// 如果找到了sources map，解析并打印
		if (match) {
			match_result = match
			console.log("找到了！！！")
			var sources = {};
			//  var sourcesDeclaration = ' sources = ' + match[1] + ';' + match[2];
			// playlists = eval(sourcesDeclaration);
			// console.log(sources)
			// playlists = sources
			var sources = {};
			var sourcesDeclaration = match[1] + match[2];
			console.log("所有的匹配结果"+sourcesDeclaration)
			var sourcesMatch = sourcesDeclaration.match(/sources\[\d+\] = \[\s*[\s\S]*?\s*\];/g);
			sourcesMatch.forEach(source => {
				console.log("匹配结果"+source)
				var sourceMatch = source.match(/sources\[(\d+)\] = \[\s*([\s\S]*?)\s*\];/);
				var sourceKey = sourceMatch[1];
				var sourceValue = sourceMatch[2].split('},').map(item => {
					console.log(item)
					item = item.trim();
					if (!item.endsWith('}')) {
						item += '}';
					}
					console.log(item)
					var itemMatch = item.match(/\{play_link: "(.*?)", ep: "(.*?)"\}/);
					if (itemMatch)
						return { play_link: itemMatch[1], ep: itemMatch[2] };
					else
						return 
				});
				sources[sourceKey] = sourceValue;
			});




			//   console.log(sources);
			playlists = sources

		}
	});
	var sites = {
		"1":"腾讯视频",
		"21":"央视频",
		"3": "优酷",
		"9": "爱奇艺",
		"8": "豆瓣",
		"13": "1905电影网",
		"15":"咪咕视频"

	}

	var channels = []
	for (let key in playlists) {
		if (sites.hasOwnProperty(key)) {
			console.log(key, playlists[key]);

			const parsedUrl = new URL(playlists[key][0]["play_link"]);
			// 获取url参数的值
			const urlParam = parsedUrl.searchParams.get('url');
			channels.push({
				"channel": sites[key],
				url:{"play_link":urlParam, "ep": playlists[key][0]["ep"]}
			})
		}
	}
	info.channels = channels;

	let tm4 = new Date().getTime();
	console.log("查询详细信息耗时" + (tm4 - tm3))
	let image_url= $pc('#mainpic').find('img').attr('src');
 
	info.Poster = "/api/images?url=" + image_url.slice(8)
	console.log(image_url)

	info.Title = $pc("span[property='v:itemreviewed']")[0].children[0].data
	info.Plot = $pc($pc("span[property='v:summary']")[0]).html();
	if ($pc('a[data-cn="爱奇艺视频"]')) {
		const url = $pc('a[data-cn="爱奇艺视频"]').attr('href');
		if (url) {
			// 创建URL对象
			const parsedUrl = new URL(url);

			// 获取url参数的值
			const urlParam = parsedUrl.searchParams.get('url');

			// 解码url参数的值
			info.PlayURL = decodeURIComponent(urlParam);
		}

	}
	info.Year = $pc('span[class=year]')[0].children[0].data;
	if ($pc("strong[property='v:average']").length > 0 && $pc("strong[property='v:average']")[0].children[0])
		info.Rated = "豆瓣：" + $pc("strong[property='v:average']")[0].children[0].data
	let actorsMeta = $pc("head > meta[property='video:actor']");
	let directorsMeta = $pc("head > meta[property='video:director']");
	//let writersMeta=$pc("head > meta[property='video:director']");

	$pc("#content > div > div.aside > script:nth-child(2)")
	let directors = [];
	let actors = []
	let writers = [""]

	if (actorsMeta) {
		for (var ai = 0; ai < actorsMeta.length && ai < 5; ai++) {
			actors.push(actorsMeta[ai].attribs["content"])
		}
	}
	if (directorsMeta) {
		for (var di = 0; di < directorsMeta.length && di < 5; di++) {
			directors.push(directorsMeta[di].attribs["content"])
		}
	}


	info.Director = directors.join(",");
	info.Actors = actors.join(",");
	info.Writer = writers.join(",");

	return info
}

async function getVectorsFromAliCloud(textArray:string[],key:string){

	let headers = new Headers({
		"Content-Type": 'application/json',
		'Authorization': `Bearer ${key}&`,
	
	});

	let body ={
		"model":"text-embedding-v2",
		"input":{
			"texts":textArray
		},
		"parameters": {
    		"text_type": "document"
    }
	}
	const vector_url = "https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/text-embedding"
	let tm2 = new Date().getTime();
	const response = await fetch(vector_url, {
		method: 'POST',
		headers: headers,
		body:body
		
	});
	var data = response.json
	return data.output.embeddings;
}






function getSimilarityForArray(text: string, textArray: string[]) {
	var simArray = []
	for (var i = 0; i < textArray.length; i++) {
		const similarityValue = jaccardSimilarity(text, textArray[i])
		simArray.push({
			"index": i,
			"value": similarityValue,
			"title":textArray[i]
		})
		
	}
	console.log(simArray)
	return simArray;
}

function getMaxSimilarText(text: string, textArray: string[]) {
	if (textArray.length == 0)
		return [];
	var simArray = getSimilarityForArray(text, textArray)
	simArray.sort(function (a, b) {
		return b.value - a.value;
	});
	console.log(simArray[0].index, textArray[simArray[0].index])
	return [simArray[0].index, textArray[simArray[0].index]]
}

// 余弦相似度
function cosineSimilarity(text1: string, text2: string) {
	// 将文本转换为字符数组
	const chars1 = text1.split('');
	const chars2 = text2.split('');

	// 创建一个包含所有字符的集合
	const charSet = new Set([...chars1, ...chars2]);

	// 计算每个字符在两个文本中的出现次数
	const charCount1 = countOccurrences(chars1);
	const charCount2 = countOccurrences(chars2);

	// 计算余弦相似度
	const dotProduct = calculateDotProduct(charCount1, charCount2);
	const magnitude1 = calculateMagnitude(charCount1);
	const magnitude2 = calculateMagnitude(charCount2);
	const similarity = dotProduct / (magnitude1 * magnitude2);

	return similarity;
}

// Jaccard相似度
function jaccardSimilarity(text1: string, text2: string) {
	// 将文本转换为字符数组
	const chars1 = text1.split('');
	const chars2 = text2.split('');

	// 创建两个字符数组的集合
	const set1 = new Set(chars1);
	const set2 = new Set(chars2);

	// 计算交集和并集的大小
	const intersectionSize = calculateIntersectionSize(set1, set2);
	const unionSize = calculateUnionSize(set1, set2);

	// 计算Jaccard相似度
	const similarity = intersectionSize / unionSize;

	return similarity;
}

function countOccurrences(chars: string) {
	const charCount = {};
	for (const char of chars) {
		if (charCount[char]) {
			charCount[char]++;
		} else {
			charCount[char] = 1;
		}
	}
	return charCount;
}

function calculateDotProduct(charCount1, charCount2) {
	let dotProduct = 0;
	for (const char in charCount1) {
		if (charCount2[char]) {
			dotProduct += charCount1[char] * charCount2[char];
		}
	}
	return dotProduct;
}

function calculateMagnitude(charCount) {
	let magnitude = 0;
	for (const char in charCount) {
		magnitude += Math.pow(charCount[char], 2);
	}
	return Math.sqrt(magnitude);
}

function calculateIntersectionSize(set1, set2) {
	let intersectionSize = 0;
	for (const char of set1) {
		if (set2.has(char)) {
			intersectionSize++;
		}
	}
	return intersectionSize;
}

function calculateUnionSize(set1, set2) {
	return set1.size + set2.size - calculateIntersectionSize(set1, set2);
}

// 示例用法
//   const text1 = "你好，世界！";
//   const text2 = "你好，大家！";
//   const cosineSimilarityValue = cosineSimilarity(text1, text2);
//   const jaccardSimilarityValue = jaccardSimilarity(text1, text2);
//   console.log(cosineSimilarityValue); // 输出：0.816496580927726
//   console.log(jaccardSimilarityValue); // 输出：0.6666666666666666

 
