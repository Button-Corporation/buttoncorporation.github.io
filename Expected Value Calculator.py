def CalculateExpectedValue(SlotPattern,Peepo=1,Minutes=10,RPM=60/3.3): #Defaults to 10 minutes
	Value=0
	CurrentSpins=0
	Spins=Minutes*RPM
	for x in SlotPattern:
		for y in SlotPattern:
			for z in SlotPattern:
				#print(x,y,z)
				if x==y and y==z:
					#Regular win
					#print("skibidi")
					Value+=1
				if x==0 and y==0 and z==0:
					#Peepo win
					#print("sigma")
					if Peepo:
						Value+=99
					pass
				CurrentSpins+=1
	return Value*Spins/CurrentSpins
"""
Balance philosophies:
- Items should be balanced around the assumption that a player will not get any peepo jackpots
- The expected return for each item should be higher than without it (duh)
"""
print("Regular gain from autoslots (not counting peepo wins):")
print(CalculateExpectedValue([0,1,1,1,2,2,2,3,3,3],Peepo=0,Minutes=5))
print("Regular gain from autoslots EX (not counting peepo wins):")
print(CalculateExpectedValue([0,1,1,1,2,2,2,3,3,3],Peepo=0,Minutes=30))
print("Peepo2X gain from autoslots:")
print(CalculateExpectedValue([0,0,1,1,1,2,2,2,3,3,3]))
print("Heartbreak gain from autoslots:")
print(CalculateExpectedValue([0,2,2,2,3,3,3],Minutes=10))