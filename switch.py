import CHIP_IO.GPIO as GPIO
import time
import subprocess



pin = "XIO-P0"

GPIO.setmode(GPIO.BCM)
GPIO.setup(pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)


try:
	while True:
		if GPIO.input(pin) == False:
			print("Door is open")
			subprocess.call(["nodejs", "hookactions.js"])
			time.sleep(30)
except KeyboardInterrupt:
	GPIO.cleanup()

GPIO.cleanup()