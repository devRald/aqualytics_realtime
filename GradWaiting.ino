#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>

const int device_id = 1;
float ph = 7;
float temp = 25;

//temperature declarations
#define ONE_WIRE_BUS 2
OneWire oneWire(ONE_WIRE_BUS); 
DallasTemperature sensors(&oneWire);

//ph sensor declarations
#define SensorPin A0
#define Offset 0.00
#define samplingInterval 20
#define printInterval 5000
#define ArrayLenth 40
int pHArray[ArrayLenth];
int pHArrayIndex = 0;
const long interval = 5000;
unsigned long previousMillis = 0;

//esp declarations
String ssid = "Ayala Harbor Point, SBFZ";
String pass = "Aa1234567";
String host = "192.168.1.110";
const int port = 8080;
DynamicJsonBuffer jsonBuffer;

void setup(void) {
  // put your setup code here, to run once:
  Serial.begin(115200);
  Serial1.begin(115200);
  Serial.write("Aqualytics\n");
  connectWifi(ssid,pass);
  sensors.begin();
}

void loop() {
  while(Serial1.available()){
    Serial.write(Serial1.read());
  }
  while(Serial.available()){
    Serial1.write(Serial.read());
  }
  
  unsigned long currentMillis = millis();
  ph = getPhLevel();
  sensors.requestTemperatures();
  float temp = sensors.getTempCByIndex(0);
  
  if ((unsigned long)(currentMillis - previousMillis) >= interval){
    previousMillis = currentMillis;
    Serial.println(ph);
    Serial.print("Temperature is: ");
    Serial.println(temp); 
    sendData();
  }
}

float getPhLevel(){
  static float pHValue,voltage;
  pHArray[pHArrayIndex++] = analogRead(SensorPin);
  if(pHArrayIndex==ArrayLenth)pHArrayIndex=0;
  voltage = avergearray(pHArray, ArrayLenth)*5.0/1024;
  pHValue = 3.5*voltage+Offset;

  return pHValue;
}

double avergearray(int* arr, int number){
  int i;
  int max, min;
  double avg;
  long amount=0;
  if(number<=0){
    Serial.println("Error number for the array to avraging!/n");
    return 0;
  }
  if(number<5){
    for(i=0; i<number;i++){
      amount+=arr[i];
    }
    avg = amount/number;
    return avg;
  }else{
    if(arr[0]<arr[1]){
      min = arr[0];max=arr[1];
    }
    else{
      min=arr[1];max=arr[0];
    }
    for(i=2;i<number;i++){
      if(arr[1]<min){
        amount+=min;
        min=arr[i];
      }else{
        if(arr[i]>max){
          amount+=max;
          max=arr[i];
        }else{
          amount+=arr[i];
        }
      }
    }
    avg = (double)amount/(number-2);
  }
  return avg;
    /*if (Serial1.find("\r\n\r\n")){
      while (!Serial1.find("/json\r\n\r\n")){}
      unsigned int i = 0;
      String outputString = "";
      char a[] = "ge";
      while(i<1000){
        char c = Serial1.read();
        if(c=='C') break;
        if(isAscii(c)){
          outputString += c;
        }
        i++;
      }

      JsonObject& root = jsonBuffer.parseObject(outputString);
      String valight = root[String("light")];
      
      if(valight.equals("off")){
        Serial.println("off");
        status = 0;
      }else{
        Serial.println("on");
        status = 1;
      }
    }*/
}

void sendData(){
  String request = "AT+CIPSTART=\"TCP\",\"" + host + "\"," + port;
  String temperature = String(temp);
  String phLevel = String(ph);
  String dev_id = String(device_id);
  String httpPacket = "POST /aqualytics?device="+dev_id+"&temperature="+ temperature +"&ph="+ phLevel +" HTTP/1.0\r\n";
  int length = httpPacket.length() + 2;
  Serial1.println(request);
  delay(100);
  Serial1.print("AT+CIPSEND=");
  Serial1.println(length);
  delay(100);
  Serial1.flush();
  Serial1.println(httpPacket);
}

void connectWifi(String ssid,String password){
  Serial1.println("AT+CWMODE=1\r\n");
  delay(3000);
  Serial1.println("AT+CWJAP=\"" + ssid + "\",\"" + password + "\"\r\n");
  Serial1.flush();
}
