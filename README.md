# Workshop Async Profiler

Welcome to this workshop to discover the power of [async-profiler](https://github.com/async-profiler/async-profiler)

## Requirements

> [!WARNNG]
> async-profiler only works for macos or linux

Here's all the tools you need to have installed of your computer in order to run this workshop:

 - [async-profiler](https://github.com/async-profiler/async-profiler/releases/)
 - [Java 17+](https://adoptium.net/fr/)
 - [Docker Compose](https://docs.docker.com/compose/)
 - [k6](https://k6.io/) (or [Docker](https://docs.docker.com/get-started/get-docker/))


## Getting started

### Start the application

You are going to run a java application. This application has some dependencies that we will discover later.

In a terminal, please run this command to start the needed dependencies:

```sh
docker compose up
```

Once it's done, let's start the application:

```sh
java -Xmx250m -Xms250m -XX:+UnlockDiagnosticVMOptions -XX:+DebugNonSafepoints -XX:TieredStopAtLevel=1 -jar workshop-async-profiler.jar
```

The application is listening on port 8080.

Make sure your application is correctly started by running:

```sh
curl http://localhost:8080/books
```

---
**NOTE**

Some explanations about the java parameters:

 - `-Xmx250m` sets the maximum heap size of the JVM to 250 MB.
 - `-Xms250m` sets the initial (and minimum) heap size of the JVM to 250 MB.
 - `-XX:+DebugNonSafepoints` this option ensures that the JVM records debug information at all points in the program (not just at safe points). Safe points are specific places in code where the JVM can pause execution for tasks like garbage collection, and this flag is useful for generating more accurate profiling information.
 - `-XX:+UnlockDiagnosticVMOptions` flag unlocks additional options for diagnosing faults or performance problems with the JVM.
 - `-XX:TieredStopAtLevel=1` disables intermediate compilation tiers (1, 2, 3). Setting this to 1 limits it to only the first level of compilation. We don't want our JVM to spend too much time into runtime optimization.
---

> When agent is not loaded at JVM startup (by using -agentpath option) it is highly recommended to use -XX:+UnlockDiagnosticVMOptions -XX:+DebugNonSafepoints JVM flags. Without those flags the profiler will still work correctly but results might be less accurate. For example, without -XX:+DebugNonSafepoints there is a high chance that simple inlined methods will not appear in the profile. When the agent is attached at runtime, CompiledMethodLoad JVMTI event enables debug info, but only for methods compiled after attaching.
> [README](https://github.com/async-profiler/async-profiler?tab=readme-ov-file#restrictionslimitations)


### Warmup

Once the application has started correctly, let's inject some traffics into our application:

```sh
k6 run k6/warmup.js
```

If k6 is not installed, you can run this script using Docker. You have to replace `localhost` with `host.docker.internal` in the `k6/warmup.js` file.


```sh
docker run --rm --add-host host.docker.internal:host-gateway -i grafana/k6 run - <k6/warmup.js
```

Inspect the warmup file and the k6 report, what can you say?


## Profiling

### 🔥 Flamegraph

During our journey into profiling, we will generate flamegraphs to inspect our application. Here's a short introduction to flamegraph:

A flamegraph is a visualization tool used to analyze performance bottlenecks in software, particularly for profiling CPU usage, memory, or execution time. It represents hierarchical data (like call stacks) in a compact, easy-to-read format, with the aim of showing where an application spends most of its time.

 - A flamegraph shows the function call hierarchy of a program, with each box representing a function or method in the call stack.
 - The x-axis represents the total time spent in a program, broken down by different functions. **The width of each box indicates how much time is spent in that particular function**.
 - The y-axis represents the call stack depth. Functions higher up in the flamegraph were called by functions below them.

Example:

![flamegraph example](./images/flamegraph_example.png)

How to read it:
 - `a()` calls `b()` and `h()`
 - `b()` calls `c()` and so on.
 - Here we can say `b()` takes more "resources" (CPU, memory, execution time) than `h()`.

Color Code:
 - 🔴 System (User native)
 - 🟢 Java
 - 🟡 C++

You can find more informations about flamegraph in the [Resources](#resources) section.

### Wall-clock profiling

Wall-clock time (also called wall time) is the time it takes to run a block of code. 
The majority of applications dealing with tiered components like a database, some HTTP or GRPC resources or a message broker (RabbiMQ, Apache Kafka, etc...) for example. In those case, the application spend most of its time on IO, waiting for those externals components to respond.

> -e wall option tells async-profiler to sample all threads equally every given period of time regardless of thread status: Running, Sleeping or Blocked.
> [README](https://github.com/async-profiler/async-profiler?tab=readme-ov-file#wall-clock-profiling)


### Inject some traffics

During our profiling, we will inject some traffics using k6.

```sh
k6 run k6/main.js
```

If k6 is not installed, you can run this script using Docker. You have to replace `localhost` with `host.docker.internal` in the `k6/main.js` file.


```sh
docker run --rm --add-host host.docker.internal:host-gateway -i grafana/k6 run - <k6/main.js
```

### Our first Flamegraph

Let's run the command during the traffic injection:

```sh
./asprof -e wall -f wall-1.html <pid>
```
async-profiler will sample during 60 seconds.

Open the generated flamegraph into your favorite browser.

## Resources

Here's a list of resources that helped me built this workshop.

- [async-profiler](https://github.com/async-profiler/async-profiler)
- [jvmperf](https://jvmperf.net/)
- [Coloring Flame Graphs: Code Hues](https://www.brendangregg.com/blog/2017-07-30/coloring-flamegraphs-code-type.html) by Brendan Gregg
- [A Guide to async-profiler](https://www.baeldung.com/java-async-profiler) by Anshul Bansal and Eric Martin
- [USENIX ATC '17: Visualizing Performance with Flame Graphs](https://www.youtube.com/watch?v=D53T1Ejig1Q) by Brendan Gregg
- [Taming performance issues into the wild: a practical guide to JVM profiling](https://www.youtube.com/watch?v=Cw4nN5L-2vU) by Francesco Nigro, Mario Fusco
- [[Java][Profiling] Async-profiler - manual by use cases](https://krzysztofslusarski.github.io/2022/12/12/async-manual.html) by Krzysztof Ślusarski
- [[Java][Profiling][Memory leak] Finding heap memory leaks with Async-profiler](https://krzysztofslusarski.github.io/2022/11/27/async-live.html) by Krzysztof Ślusarski
- [Java Safepoint and Async Profiling](https://seethawenner.medium.com/java-safepoint-and-async-profiling-cdce0818cd29) by Seetha Wenner
- 🇫🇷 [Traquer une fuite mémoire : cas d’étude avec Hibernate 5, ne tombez pas dans le IN !](https://www.sfeir.dev/back/traquer-une-fuite-memoire-cas-detude-avec-hibernate-5-ne-tombez-pas-dans-le-in/) by Ling-Chun SO
- 🇫🇷 [Sous le capot d'une application JVM - Java Flight Recorder / Java Mission Control
](https://www.youtube.com/watch?v=wa_EtTUx-z0) by Guillaume Darmont







