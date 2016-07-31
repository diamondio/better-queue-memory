var assert = require('assert');

exports.basic = function (name, opts) {
  var create = opts.create || function(cb){cb()};
  var destroy = opts.destroy || function(cb){cb()};

  describe(name || 'Store', function () {

    beforeEach(function (done) {
      var ctx = this;
      create(function (err, store) {
        if (err) throw err;
        ctx.store = store;
        done();
      });
    })
    afterEach(function (done) {
      destroy(done);
    })

    it('all required functions exist', function () {
      assert.equal(typeof this.store.connect, 'function');
      assert.equal(typeof this.store.getTask, 'function');
      assert.equal(typeof this.store.putTask, 'function');
      assert.equal(typeof this.store.deleteTask, 'function');
      assert.equal(typeof this.store.takeFirstN, 'function');
      assert.equal(typeof this.store.takeLastN, 'function');
      assert.equal(typeof this.store.getLock, 'function');
      assert.equal(typeof this.store.getRunningTasks, 'function');
      assert.equal(typeof this.store.releaseLock, 'function');
    })

    it('connect starts empty', function (done) {
      this.store.connect(function (err, len) {
        if (err) throw err;
        assert.equal(len, 0, 'should start empty');
        done();
      })
    })

    it('put and get', function (done) {
      var store = this.store;
      store.putTask('test', { value: 'secret' }, 1, function (err) {
        if (err) throw err;
        store.getTask('test', function (err, task) {
          if (err) throw err;
          assert.equal(task.value, 'secret', 'should get the task');
          done();
        })
      })
    })

    it('put 3, take last 2, take last 2', function (done) {
      var store = this.store;

      // Put 3
      store.putTask('task1', { value: 'secret 1' }, 1, function (err) {
        if (err) throw err;
      store.putTask('task2', { value: 'secret 2' }, 1, function (err) {
        if (err) throw err;
      store.putTask('task3', { value: 'secret 3' }, 1, function (err) {
        if (err) throw err;

        // Take 2
        store.takeLastN(2, function (err, lockId) {
          if (err) throw err;
          store.getLock(lockId, function (err, tasks) {
            if (err) throw err;
            assert.equal(tasks.task3.value, 'secret 3', 'should get the third task');
            assert.equal(tasks.task2.value, 'secret 2', 'should get the second task');
            assert.ok(!tasks.task1, 'should not get the first task');

            // Take 2
            store.takeLastN(2, function (err, lockId) {
              if (err) throw err;
              store.getLock(lockId, function (err, tasks) {
                if (err) throw err;
                assert.ok(!tasks.task3, 'should not get the third task');
                assert.ok(!tasks.task2, 'should not get the second task');
                assert.equal(tasks.task1.value, 'secret 1', 'should get the first task');
                done();
              })
            })
          })
        })
      })})})
    })

    it('put 3, take first 2, take first 2', function (done) {
      var store = this.store;

      // Put 3
      store.putTask('task1', { value: 'secret 1' }, 1, function (err) {
        if (err) throw err;
      store.putTask('task2', { value: 'secret 2' }, 1, function (err) {
        if (err) throw err;
      store.putTask('task3', { value: 'secret 3' }, 1, function (err) {
        if (err) throw err;

        // Take 2
        store.takeFirstN(2, function (err, lockId) {
          if (err) throw err;
          store.getLock(lockId, function (err, tasks) {
            if (err) throw err;
            assert.equal(tasks.task1.value, 'secret 1', 'should get the first task');
            assert.equal(tasks.task2.value, 'secret 2', 'should get the second task');
            assert.ok(!tasks.task3, 'should not get the third task');

            // Take 2
            store.takeFirstN(2, function (err, lockId) {
              if (err) throw err;
              store.getLock(lockId, function (err, tasks) {
                if (err) throw err;
                assert.ok(!tasks.task1, 'should not get the first task');
                assert.ok(!tasks.task2, 'should not get the second task');
                assert.equal(tasks.task3.value, 'secret 3', 'should get the third task');
                done();
              })
            })
          })
        })
      })})})
    })

    it('get and release workers', function (done) {
      var store = this.store;

      // Put 3
      store.putTask('task1', { value: 'secret 1' }, 1, function (err) {
        if (err) throw err;
      store.putTask('task2', { value: 'secret 2' }, 1, function (err) {
        if (err) throw err;
      store.putTask('task3', { value: 'secret 3' }, 1, function (err) {
        if (err) throw err;

        // take 1
        store.takeFirstN(1, function (err, lock1) {
          if (err) throw err;

        // take 1
        store.takeLastN(1, function (err, lock2) {
          if (err) throw err;

          store.getRunningTasks(function (err, workers) {
            if (err) throw err;
            assert.ok(workers[lock1], 'should have first lock');
            assert.ok(workers[lock2], 'should have second lock');
            assert.equal(Object.keys(workers).length, 2, 'should have one worker');
            assert.equal(workers[lock1].task1.value, 'secret 1', 'should have task1');
            assert.equal(workers[lock2].task3.value, 'secret 3', 'should have task3');

            // Release locks
            store.releaseLock(lock1, function (err) {
              if (err) throw err;
            store.releaseLock(lock2, function (err) {
              if (err) throw err;

              store.getRunningTasks(function (err, workers) {
                if (err) throw err;
                assert.ok(!workers[lock1], 'should not have lock 1');
                assert.ok(!workers[lock2], 'should not have lock 2');
                assert.equal(Object.keys(workers).length, 0, 'should have one worker');
                done();
              })

            })})
          })

        })})
      })})})
    })

    it('put 4, delete 1, take first 2', function (done) {
      var store = this.store;

      // Put 4
      store.putTask('task1', { value: 'secret 1' }, 1, function (err) {
        if (err) throw err;
      store.putTask('task2', { value: 'secret 2' }, 1, function (err) {
        if (err) throw err;
      store.putTask('task3', { value: 'secret 3' }, 1, function (err) {
        if (err) throw err;
      store.putTask('task4', { value: 'secret 4' }, 1, function (err) {
        if (err) throw err;

        // Remove the second
        store.deleteTask('task2', function (err) {
          if (err) throw err;

          // take 2
          store.takeFirstN(2, function (err, lockId) {
            if (err) throw err;

            store.getLock(lockId, function (err, tasks) {
              if (err) throw err;
              assert.equal(tasks.task1.value, 'secret 1', 'should get the first task');
              assert.ok(!tasks.task2, 'should not get the second task');
              assert.equal(tasks.task3.value, 'secret 3', 'should get the third task');
              assert.ok(!tasks.task4, 'should not get the fourth task');
              done();
            })
          })
        })
      })})})})
    })

  })

}
