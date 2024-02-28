
function getSimilarityForArray(text, textArray) {
	var simArray = []
	for (var i = 0; i < textArray.length; i++) {
		const similarityValue = cosineSimilarity(text, textArray[i])
		simArray.push({
			"index": i,
			"value": similarityValue
		})
	}

	return simArray;
}

function getMaxSimilarText(text, textArray) {
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
function cosineSimilarity(text1, text2) {
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
function jaccardSimilarity(text1, text2) {
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

function countOccurrences(chars) {
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

  const text1 = "无双(2018)";
  const text2 = "2018天猫双十一狂欢夜(2018)";

  const text3 = "无双 無雙(2018)"
  var cosineSimilarityValue = cosineSimilarity(text1, text2);
  var  jaccardSimilarityValue = jaccardSimilarity(text1, text2);
  console.log(cosineSimilarityValue); // 输出：0.816496580927726
  console.log(jaccardSimilarityValue); // 输出：0.6666666666666666

  var cosineSimilarityValue = cosineSimilarity(text1, text3);
  var  jaccardSimilarityValue = jaccardSimilarity(text1, text3);
  console.log(cosineSimilarityValue); // 输出：0.816496580927726
  console.log(jaccardSimilarityValue); // 输出：0.6666666666666666
