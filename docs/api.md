# Avis Telemetry API

The avis telemetry API website can be accessed using the Rest or UDP APIs,
currently hosted on [avistel.es](https://avistel.es).

## Rest API

The avis telemetry API provides a few useful Rest endpoints,
intended to receive telemetry data from devices and store remote configurations.

### Send measure: `POST /devices/:device/measures`

Send a measure to the server for the device `:device`. Receives:

* A flat JSON body.
  - Include an attribute `takenAt` to store the time the measure was taken.
* Content type must be `application/json`.

Info stored includes device identifier `:device`, date received, and IP address.

Bash example:

```
curl -d '{"value": 75, "secret": "api"}' -H "Content-Type: application/json" https://avistel.es/devices/api-test-device/measures
```

**Note**:
The API will reject measures if they are sent more often than 10 times per second.
There is currently a size limitation of 1024 bytes per measure,
which can be modified without notice.
The API will reject measures where the `secret` does not match the previous value,
to avoid spoofing.

### Get latest measure: `GET /devices/:device/measures/latest`

Returns the latest measure as a JSON document.

Bash example:

```
wget https://avistel.es/devices/api-test-device/measures/latest
```

Returns:

```
{"id":"f23849b8-ae00-47be-9cab-e747ee962947","device":"api-test-device","measure":{"value":85},"createdAt":"2025-06-16 18:03:59.013","takenAt":"2025-06-16 18:03:58.244","source":"post 192.158.5.3"}
```

**Note**:
The API will not return the `secret` with the measure.

### Get last n measures: `GET /devices/:device/measures`

Returns the last 10 measures as a JSON array.
Bash example:

```
wget https://avistel.es/devices/api-test-device/measures
```

Returns:

```
[{"id":"f23849b8-ae00-47be-9cab-e747ee962947","device":"api-test-device","measure":{"value":85},"createdAt":"2025-06-16 18:03:59.013","takenAt":"2025-06-16 18:03:58.244","source":"post 192.158.5.3"}, ...]
```

Accepts an optional query parameter `?limit=n` to ask for the last `n` values:

```
wget https://avistel.es/devices/api-test-device/measures?limit=15
```

Or just browse [the device page](https://avistel.es/show/api-test-device)
changing your device identifier instead of `api-test-device`.

**Note**:
Neither the API nor the pages will return the `secret` with the measures.

### Store configuration: `PUT /devices/:device/config`

Store the configuration for device `:device`. Receives:

* A flat JSON body.
* Content type must be `application/json`.

Info stored includes device identifier `:device`, date received, and IP address.

Bash example:

```
curl -X -d '{"param": 17, "secret": "api"}' -H "Content-Type: application/json" https://avistel.es/devices/api-test-device/config
```

**Note**:
The API will reject configurations if they are sent more often than 10 times per second.
There is currently a size limitation of 1024 bytes per configuration,
which can be modified without notice.
The API will reject configurations where the `secret` does not match the previous value,
to avoid spoofing.

### Retrieve configuration: `GET /devices/:device/config`

Get the latest configuration for device `:device`.

Bash example (use `wget` or `curl` according to your preference):

```
wget https://avistel.es/devices/api-test-device/config
curl https://avistel.es/devices/api-test-device/config
```

Or just browse [the device page](https://avistel.es/show/api-test-device)
changing your device identifier instead of `api-test-device`.

**Note**:
Neither the API nor the pages will return the `secret` with the config.

## UDP API

Measures can also be sent using UDP, which is less onerous on devices:
just "fire-and-forget" a packet with the desired telemetry.

### Send measure: UDP packet

Send a UDP packet to the correct port, by default 4215.
The packet should contain a valid JSON document,
preferably using UTF-8 encoding.
Otherwise the spec is identical to the Rest API `POST /devices/:device/measures`,
except that the `"device"` identifier must be included in the JSON document.

JSON example:

```
{"device": "udp-test-device", "value": 76, "secret": "udp"}
```

Bash example:

```
echo '{"device": "udp-test-device", "value": 76, "secret": "udp"}' | nc -4u -q 1 avistel.es 4215
```

Arduino example, using the [ArduinoJson](project):

```
NetworkUDP udp;
JsonDocument doc;
char output[1024];
const char *udpAddress = "avistel.es";
const int udpPort = 4215;
const char *device = "arduino-test-device";
const char *secret = "my-secret";

void setup() {
  // ... connect to the internet, possibly using WiFi
}

void loop() {
  while (true) {
    doc["device"] = device;
    doc["value"] = 7;
    doc["secret"] = secret;
    // ... add other values as string or number
    serializeJson(doc, output);
    udp.beginPacket(udpAddress, udpPort);
    udp.printf(output);
    udp.endPacket();
  }
  delay(1000);
}
```

In this case you must provide the device identifier in the body.

**Note**:
The API will reject configurations if they are sent more often than 10 times per second.
There is currently a size limitation of 1024 bytes per measure,
which can be modified without notice.
The API will reject measures where the `secret` does not match the previous value,
to avoid spoofing.

