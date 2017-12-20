import processing.serial.*;
import java.awt.event.KeyEvent;

// Settings --------------------------------------------------------------------------
int serialBaudRate=115200;
int bufferSize=10000000;      // number of samples (memory use: 2 bytes per sample)
float samplesPerLine=1;       // increment 1 screen line for each [n] samples
boolean sync=true;            // sync to trig
float trigLevelLPF=.0001;     // trigLevel lowpass filter (exponential moving average)
boolean hold=false;           // pause
int prescaler=5;              // ADC prescaler: 3:8 | 4:16 | 5:32 | 6:64 | 7:128
// -----------------------------------------------------------------------------------

Serial serial;
PFont font= createFont("Lucida Console", 12, false);
byte[] buffer= new byte[bufferSize*2];
int writeIndex, prevWriteIndex, readIndex, trigIndex, trigCounter, loopCounter, windowWidth, windowHeight, offset;
float voltageRange, sps, frequency, trigLevel, timer;
int windowX=30;
int windowY=50;
boolean connected=false;
String serialPort;

void setup() {
  size(1000, 600);
  background(0, 0, 0);
  frame.setResizable(true);
  frameRate(50);    
  textFont(font);
  text("ARDUINO OSCILLOSCOPE\n\nSelect serial port:", 25, 25);
  for (int i=0;i<Serial.list().length;i++)
    text("F"+(i+1)+" - "+Serial.list()[i], 25, 80+i*20);
}

void draw() {
  windowWidth=width-100;
  windowHeight=height-100;

  if (connected) {
    background(0, 0, 0);
    
    // update frequency counters every second
    loopCounter++;
    if (loopCounter>frameRate) {  
      loopCounter=0;
      float elapsedSeconds=(millis()-timer)/1000;
      timer=millis();
      sps=(writeIndex-prevWriteIndex)/elapsedSeconds;  // sample rate
      if (sps<0)sps+=bufferSize;
      prevWriteIndex=writeIndex;
      frequency=trigCounter/elapsedSeconds;            // signal frequency
      trigCounter=0;
    }

    // read switch position & set voltage range
    boolean switch1=((buffer[writeIndex*2]&(byte)8)==8);                                                 
    boolean switch2=((buffer[writeIndex*2]&(byte)4)==4);
    if (!switch1&&!switch2) voltageRange=20;
    if (!switch1&&switch2) voltageRange=10;
    if (switch1&&!switch2) voltageRange=6.64;
    if (switch1&&switch2) voltageRange=5;

    // print voltage scale
    for (int n=0; n<=10; n++)                                                                           
      text(nf(voltageRange/10*n, 2, 2)+"V", windowX+windowWidth+5, windowY+windowHeight-(n*windowHeight/10));

    // print interface and statistics
    text("[F1-F2] ZOOM | [F3] SYNC: "+sync+" | [F4] HOLD: "+hold+" | [F5-F6] TRIG LPF | [F7-F8] PRESCALER: "+nf((pow(2, prescaler)), 1, 0)+" | [<--->] OFFSET", 25, 25);
    text("frequency: "+nf(frequency, 5, 2)+"Hz"
      +" | average DCV: "+nf(trigLevel/1024*voltageRange, 2, 2)+"V"
      +" | samplerate: "+nf(sps, 5, 2)+"Hz"
      +" | samples per line: "+samplesPerLine
      +" | division: "+samplesPerLine/sps*(float)width*100+"ms", 25, height-20);

    // draw trigLevel (= average voltage) line
    stroke(0, 0, 100);                                                                                   
    int trigLevelHeight=(int)(trigLevel*(float)windowHeight/1024);
    line(windowX, windowY+windowHeight-trigLevelHeight, windowX+windowWidth, windowY+windowHeight-trigLevelHeight);  

    // draw grid
    stroke(50);                                                                                           
    for (float n=0; n<=windowWidth; n+=(float)windowWidth/10) 
      line(n+windowX, windowY, n+windowX, windowHeight+windowY); 
    for (float n=0; n<=windowHeight; n+=(float)windowHeight/10) 
      line(windowX, n+windowY, windowX+windowWidth, n+windowY);

    // ------------------------------
    // DRAW WAVEFORM
    // ------------------------------
    stroke(255);
    float prevSampleValue=0;
    if (sync) readIndex=trigIndex;                               // sync: start reading from last trig position
    if (!sync) readIndex=writeIndex;                             // no sync: start reading from last sample we received
    readIndex+=offset;
    float lineIncr=(float)1/samplesPerLine;
    if (lineIncr<1) lineIncr=1;
    for (float line=0; line<windowWidth; line+=lineIncr) {                                          // cycle screen lines (from right to left)
      float sampleValue=(float)getValueFromBuffer((int)((float)readIndex-line*samplesPerLine));     // get the value for the screen line
      sampleValue*=(float)windowHeight/1024;                                                        // scale to windowHeight
      if (line>0)
        line(windowX+windowWidth-line, 
        windowY+windowHeight-prevSampleValue, 
        windowX+windowWidth-line-lineIncr, 
        windowY+windowHeight-sampleValue);
      prevSampleValue=sampleValue;
    }

    // ------------------------------
    // BUFFER INCOMING BYTES & TRIG 
    // ------------------------------
    if (hold) {
      serial.clear();                                                                                      // HOLD: don't receive samples; clear serial buffer
    }
    else {
      while (serial.available ()>0) {                                                                      // RUN: receive samples
        writeIndex++;  
        if (writeIndex>=bufferSize) writeIndex=0;                                                          // handle overflow
        buffer[writeIndex+writeIndex]=(byte)serial.read();                                                 // add 1 sample (2 bytes) to buffer 
        buffer[writeIndex+writeIndex+1]=(byte)serial.read();
        trigLevel=trigLevel*(1-trigLevelLPF)+(float)getValueFromBuffer(writeIndex)*trigLevelLPF;           // level for trigger intersection = exponential moving average of voltage
        if (getValueFromBuffer(writeIndex)>=trigLevel&& getValueFromBuffer(writeIndex-1)<trigLevel) {      // rising intersect detected
          trigIndex=writeIndex;                                                                            // set trigIndex (index of buffer that corresponds to last trig)
          trigCounter++;                                                                                   // count trigs (to calculate the frequency)
        }
      }
    }
  }
}

// Read value from buffer
int getValueFromBuffer(int index) {                                                                      
  while (index<0) index+=bufferSize;                                                                       // handle overflow of circular buffer
  return((buffer[index*2]&3)<<8 | buffer[index*2+1]&0xff);                                                 // convert bytes to int
}

// Handle keys
void keyPressed() {  
  if (key == CODED) {
    if (connected) {
      if (keyCode == KeyEvent.VK_F1) {
        samplesPerLine*=1.1;
        if (samplesPerLine*windowWidth>bufferSize) samplesPerLine=bufferSize/windowWidth;
      }
      if (keyCode == KeyEvent.VK_F2) {
        samplesPerLine/=1.1;
        if (samplesPerLine<1/(float)windowWidth) samplesPerLine=1/(float)windowWidth;
      }
      if (keyCode == KeyEvent.VK_F3) {
        sync=!sync;
      }
      if (keyCode == KeyEvent.VK_F4) {
        hold=!hold;
      }
      if (keyCode == KeyEvent.VK_F5) {
        if (trigLevelLPF<.01) trigLevelLPF*=10;
      }
      if (keyCode == KeyEvent.VK_F6) {
        if (trigLevelLPF>.000001) trigLevelLPF/=10;
      }
      if (keyCode == KeyEvent.VK_F7) {
        if (prescaler>3) prescaler--;
        serial.write((byte)prescaler);
      }
      if (keyCode == KeyEvent.VK_F8) {
        if (prescaler<7) prescaler++;
        serial.write((byte)prescaler);
      }
      if (keyCode == LEFT) {
        offset-=samplesPerLine*20;
        if (offset<-bufferSize) offset=-bufferSize;
      }
      if (keyCode == RIGHT) {
        offset+=samplesPerLine*20;
        if (offset>0) offset=0;
      }
    }
    else {
      serial = new Serial(this, Serial.list()[keyCode-112], serialBaudRate);
      serial.write((byte)prescaler);
      connected=true;
    }
  }
}

