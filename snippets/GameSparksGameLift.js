function trimAll (str)
{
    var matches = str.match(/("[^"]+"|[^\s]+)/g);
    return matches ? matches.join(' ') : '';
}
 
function HMAC (key, data)
{
    return Spark.getDigester().hmacSha256Hex(key, data);
}
 
var AWSRequest = function ( endpoint,
                            canonicalURI,
                            query,
                            headers,
                            requestPayload,
                            region,
                            serviceName,
                            creds
)
{
    this.httpRequestMethod = 'POST';
    this.endpoint = endpoint;
    this.canonicalURI = canonicalURI;
    this.query = query;
    this.headers = headers;
    this.requestPayload = requestPayload;
    this.region = region;
    this.serviceName = serviceName;
    this.accessKeyID = creds.key;
    this.secretKey = creds.secret;
    this.date = new Date();
    this.headers.push(
        {
            name: 'x-amz-date',
            value: this.getFullAmznDateString()
        }
    );
    this.headers.push(
        {
            name: 'host',
            value: this.endpoint
        }
    );
};
 
AWSRequest.prototype.getFullAmznDateString = function ()
{
    return this.date.toISOString().replace(/\.\d\d\dZ/, 'Z').replace(/[^\dTZ]/g, '');
};
 
AWSRequest.prototype.getAmznDateString = function ()
{
    return this.getFullAmznDateString().replace(/T.*$/, '');
};
 
AWSRequest.prototype.constructCanonicalRequest = function ()
{
    return this.httpRequestMethod + '\n' +
        this.canonicalURI + '\n' +
        this.constructCanonicalQueryString() + '\n' +
        this.constructCanonicalListOfHeaders() + '\n' +
        this.constructSignedHeaders() + '\n' +
        Spark.getDigester().sha256Hex(this.requestPayload)
};
 
AWSRequest.prototype.constructCanonicalQueryString = function ()
{
    var componentNames = [];
    for (var componentName in this.query)
    {
        if (this.query.hasOwnProperty(componentName))
        {
            componentNames.push(componentName);
        }
    }
 
    var encodedComponentNamesToOriginalMap = {};
    var encodedComponentNames = [];
 
    componentNames.forEach(
        function (componentName)
        {
            var encodedComponentName = encodeURIComponent(componentName);
            encodedComponentNamesToOriginalMap[encodedComponentName] = componentName;
            encodedComponentNames.push(encodedComponentName);
        }
    );
 
    var finalComponents = [];
 
    encodedComponentNames.sort();
 
    encodedComponentNames.forEach(
        function (encodedComponentName)
        {
            var originalComponentName = encodedComponentNamesToOriginalMap[encodedComponentName];
            //noinspection JSPotentiallyInvalidUsageOfThis
            var componentValue = this.query[originalComponentName];
            finalComponents.push(encodedComponentName + '=' + encodeURIComponent(componentValue));
        }
    );
 
    return finalComponents.join('&');
};
 
AWSRequest.prototype.constructCanonicalListOfHeaders = function ()
{
    var canonicalHeaders = [];
    this.headers.forEach(
        function (header)
        {
            canonicalHeaders.push(header.name.toLowerCase() + ':' + trimAll(header.value));
        }
    );
    canonicalHeaders.sort();
    return canonicalHeaders.join('\n') + '\n';
};
 
AWSRequest.prototype.constructSignedHeaders = function ()
{
    var signedHeaders = [];
    this.headers.forEach(
        function (header)
        {
            signedHeaders.push(header.name.toLowerCase());
        }
    );
    signedHeaders.sort();
    return signedHeaders.join(';');
};
 
AWSRequest.prototype.constructCredentialScope = function ()
{
    return this.getAmznDateString() + '/' +
        this.region + '/' +
        this.serviceName + '/' +
        'aws4_request';
};
 
AWSRequest.prototype.constructStringToSign = function ()
{
    var canonicalRequest = this.constructCanonicalRequest();
    var hash = Spark.getDigester().sha256Hex(canonicalRequest);
    return 'AWS4-HMAC-SHA256' + '\n' +
        this.getFullAmznDateString() + '\n' +
        this.constructCredentialScope() + '\n' +
        hash;
};
 
AWSRequest.prototype.deriveSigningKey = function ()
{
    var kDate = HMAC("AWS4" + this.secretKey, this.getAmznDateString());
    var kRegion = HMAC(kDate, this.region);
    var kService = HMAC(kRegion, this.serviceName);
    return HMAC(kService, "aws4_request");
};
 
AWSRequest.prototype.calculateSignature = function ()
{
    return HMAC(this.constructStringToSign(), this.deriveSigningKey())
};
 
AWSRequest.prototype.constructAuthorizationHeader = function ()
{
    return 'Authorization: AWS4-HMAC-SHA256 Credential=' +
        this.accessKeyID + '/' + this.constructCredentialScope() +
        ', SignedHeaders=' + this.constructSignedHeaders() +
        ', Signature=' + this.calculateSignature();
};
 
/**
 *
 * @param callback function with 2 parameters (both objects): result and error
 */
AWSRequest.prototype.makeRequest = function (callback)
{
    var headers = {};
    this.headers.forEach(
        function (header)
        {
            headers[header.name] = header.value;
        }
    );
    headers.Authorization = this.constructAuthorizationHeader().substring('Authorization: '.length);
 
    var postUrl = 'https://' + this.endpoint + this.canonicalURI;
 
    var httpSender = Spark.getHttp(postUrl);
    httpSender.setHeaders(headers);
    var awsResponse = httpSender.postString(this.requestPayload);
    
    if (awsResponse.getResponseCode() >= 200 && awsResponse.getResponseCode() < 300) 
    {
        callback(
            {
                statusCode: awsResponse.getResponseCode(),
                headers: awsResponse.getHeaders(),
                data: awsResponse.getResponseJson()
            }, 
            null //no error.
        );
    } 
    else
    {
        callback(
            null, //no response data
            {
                statusCode: awsResponse.getResponseCode(),
                headers: awsResponse.getHeaders(),
                data: awsResponse.getResponseJson()
            }
        );
    }
};

