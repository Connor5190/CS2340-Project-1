from django.shortcuts import render

def testview(request):
    return render(request,'test.html')