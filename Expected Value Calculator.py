def CalculateExpectedValue(SlotPattern,Spins=60/1.9*10): #Defaults to 10 minutes
	Value=0
	CurrentSpins=0
	for x in SlotPattern:
		for y in SlotPattern:
			for z in SlotPattern:
				print(x,y,z)
				if x==y and y==z:
					#Regular win
					print("skibidi")
					Value+=1
				if x==0 and y==0 and z==0:
					#Peepo win
					print("sigma")
					Value+=99
				CurrentSpins+=1
	return Value*Spins/CurrentSpins

print("Regular gain from autoslots:")
print(CalculateExpectedValue([0,1,1,1,2,2,2,3,3,3])-25)
print("Peepo2X gain from autoslots:")
print(CalculateExpectedValue([0,0,1,1,1,2,2,2,3,3,3])-25-125)