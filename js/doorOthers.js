// ===================== Пример кода первой двери =======================
/**
 * @class Door0
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */
function Door0(number, onUnlock) {
    DoorBase.apply(this, arguments);

    var buttons = [
        this.popup.querySelector('.door-riddle__button_0'),
        this.popup.querySelector('.door-riddle__button_1'),
        this.popup.querySelector('.door-riddle__button_2')
    ];

    buttons.forEach(function(b) {
        b.addEventListener('pointerdown', _onButtonPointerDown.bind(this));
        b.addEventListener('pointerup', _onButtonPointerUp.bind(this));
        b.addEventListener('pointercancel', _onButtonPointerUp.bind(this));
        b.addEventListener('pointerleave', _onButtonPointerUp.bind(this));
    }.bind(this));

    function _onButtonPointerDown(e) {
        e.target.classList.add('door-riddle__button_pressed');
        checkCondition.apply(this);
    }

    function _onButtonPointerUp(e) {
        e.target.classList.remove('door-riddle__button_pressed');
    }

    /**
     * Проверяем, можно ли теперь открыть дверь
     */
    function checkCondition() {
        var isOpened = true;
        buttons.forEach(function(b) {
            if (!b.classList.contains('door-riddle__button_pressed')) {
                isOpened = false;
            }
        });

        // Если все три кнопки зажаты одновременно, то откроем эту дверь
        if (isOpened) {
            this.unlock();
        }
    }
}

// Наследуемся от класса DoorBase
Door0.prototype = Object.create(DoorBase.prototype);
Door0.prototype.constructor = DoorBase;
// END ===================== Пример кода первой двери =======================

/**
 * @class Door1
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */
function Door1(number, onUnlock) {
    DoorBase.apply(this, arguments);

    // ==== Напишите свой код для открытия второй двери здесь ====    

    // Сохранение списка знаков и информации о них, с содержанием привязки каждого знака попарно
    var signList = this.popup.querySelector('.door-riddle__sign-list');
    var signs = [];
    for (var i = 0; i < signList.children.length; i++) {        
        var sign = this.popup.querySelector('.door-riddle__sign_' + i);        
        var matchSign = this.popup.querySelector('.' + sign.dataset.match);
        sign.info = {
            startPosition: {},           
            currentPosition: {},
            match: matchSign,
            pressed: false
        }
        signs.push(sign);
    }  

    // Подписка на события указателя
    signs.forEach(function(s) {        
        s.addEventListener('pointerdown', _onButtonPointerDown.bind(this));
        s.addEventListener('pointermove', _onButtonPointerMove.bind(this));
        s.addEventListener('pointerup', _onButtonPointerUp.bind(this));
        s.addEventListener('pointercancel', _onButtonPointerUp.bind(this));
        s.addEventListener('pointerleave', _onButtonPointerUp.bind(this));
    }.bind(this));

    // Обработчик нажатия на знак
    function _onButtonPointerDown(e) {
        var sign = e.target;   
        sign.setPointerCapture(e.pointerId);     
        sign.info.startPosition.X = e.pageX;
        sign.info.startPosition.Y = e.pageY;
        sign.info.currentPosition.X = e.pageX;  
        sign.info.currentPosition.Y = e.pageY;        
        sign.info.pressed = true;                    
    }

    // Обработчик перемещения указателя
    function _onButtonPointerMove(e) {
        var sign = e.target;
        if (!sign.info.pressed) {
            return;
        }

        sign.info.currentPosition.X = e.pageX;
        sign.info.currentPosition.Y = e.pageY;
        moveSign(sign);
    }

    // Обработчик отжатия указателя
    function _onButtonPointerUp(e) {
        var sign = e.target;
        if (!sign.info.pressed) {
            return;
        }                
        sign.info.pressed = false;

        checkSign(sign);
        checkCondition.apply(this);
        requestAnimationFrame(function() {
            sign.style.transform = 'translate3d(0,0,0)';
            sign.style.webkitTransform = 'translate3d(0,0,0)';
        });         
    }

    // Метод перемещения знака
    function moveSign(sign) {          
        requestAnimationFrame(function() {
            var diffX = sign.info.currentPosition.X - sign.info.startPosition.X; 
            var diffY = sign.info.currentPosition.Y - sign.info.startPosition.Y;                
            sign.style.transform = 'translate3d('+ diffX +'px, '+ diffY +'px, 0px)';
            sign.style.webkitTransform = 'translate3d('+ diffX +'px, '+ diffY +'px, 0px)';          
        });        
    }

    // Метод проверки соответствия знака
    function checkSign(sign) {
        var signRect = sign.getBoundingClientRect();
        var matchRect = sign.info.match.getBoundingClientRect();        
        if (hasIntersection(signRect, matchRect)) {
           sign.classList.add('door-riddle__sign_matched');
           sign.info.match.classList.add('door-riddle__sign_matched'); 
        }
    }
    
    // Метод, проверяющий выполнение условия попарных соответствий
    function checkCondition() {        
        var allMatched = true;
        for (var i = 0; i < signs.length; i++) {
            var sign = signs[i];
            if (!sign.classList.contains('door-riddle__sign_matched')) {
                allMatched = false;
                break;
            }
        }        
        if (allMatched) {
            this.unlock();
        }
    }

    // Метод пересечения двух прямоугольников
    function hasIntersection(a, b) {
        if (a.left < b.left + b.width && b.left < a.left + a.width && a.top < b.top + b.height)
            return b.top < a.top + a.height;
        else
            return false;
    }

    // ==== END Напишите свой код для открытия второй двери здесь ====
}
Door1.prototype = Object.create(DoorBase.prototype);
Door1.prototype.constructor = DoorBase;

/**
 * @class Door2
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */
function Door2(number, onUnlock) {
    DoorBase.apply(this, arguments);

    // ==== Напишите свой код для открытия третей двери здесь ====
    
    var PINCH_SCALE_MIN = 0.9;
    var PINCH_SCALE_MAX = 1.1;
    var TARGET_SCALE = 1;

    var occurredEvents = [];    // Кэш произошедших событий Pointer Event
    var prevDiff = -1;          // Дистанция между точками при предудущем событии
    var startAngle = 0;         // Начальный угол между линией, образованной точками и осью координат

    var picBoxes = [ 
        this.popup.querySelector('.door-riddle__map-part_0'),
        this.popup.querySelector('.door-riddle__map-part_1'),
        this.popup.querySelector('.door-riddle__map-part_2'),
        this.popup.querySelector('.door-riddle__map-part_3')];    

    var i = 0;
    picBoxes.forEach(function(picBox) {
        picBox.info = {
            curScale: 1,
            visibleScale: 0
        };
        picBox.addEventListener('pointerdown', _onButtonPointerDown.bind(this));
        picBox.addEventListener('pointermove', _onButtonPointerMove.bind(this));
        picBox.addEventListener('pointerup', _onButtonPointerUp.bind(this));
        picBox.addEventListener('pointercancel', _onButtonPointerUp.bind(this));
        picBox.addEventListener('pointerleave', _onButtonPointerUp.bind(this));
        i++;
    }.bind(this));
    
    // Сохрянаем контекст для вызова метода проверки открытия двери
    var checkCondition = _checkCondition.bind(this);

    function _onButtonPointerDown(e) {
        var picBox = e.target;   
        picBox.setPointerCapture(e.pointerId);
        occurredEvents.push(e);                

        if (occurredEvents.length == 2) {
            var curDiffX = occurredEvents[0].clientX - occurredEvents[1].clientX;
            var curDiffY = occurredEvents[0].clientY - occurredEvents[1].clientY;

            startAngle = Math.atan(curDiffY / curDiffX) * rad2deg;
            picBox.info.beginAngle = picBox.info.curAngle;            
        }
    }

    function _onButtonPointerMove(e) {
        var picBox = e.target;

        // Обновляем данные о событии в кэше по его идентификатору
        for (var i = 0; i < occurredEvents.length; i++) {
            if (e.pointerId == occurredEvents[i].pointerId) {
                occurredEvents[i] = e;
                break;
            }
        }        

        if (occurredEvents.length == 2) {
            // Расчитываем расстояние между точками 
            var curDiffX = occurredEvents[0].clientX - occurredEvents[1].clientX;
            var curDiffY = occurredEvents[0].clientY - occurredEvents[1].clientY;
            var curDiff = Math.sqrt(Math.pow(curDiffX, 2) + Math.pow(curDiffY, 2));

            if (prevDiff > 0) {                
                // Получаем текущую ширину бокса с картинкой
                var curWidth = picBox.getBoundingClientRect().width;

                // Расчет относительной велечины трансформации
                var relativeScale = 1;
                var scaleDiff = Math.abs(curDiff - prevDiff);
                if (curDiff > prevDiff) {
                    // для случая когда расстояние между точками увеличилось
                    relativeScale = (curWidth + scaleDiff) / curWidth;
                }                 
                else if (curDiff < prevDiff) {                    
                    // для случая когда расстояние между точками уменьшилось
                    relativeScale = (curWidth - scaleDiff) / curWidth; 
                }

                // Расчет абсолютной величины трансформации
                picBox.info.curScale = picBox.info.curScale * relativeScale;                

                // Пин при заданном масштабе
                picBox.info.visibleScale = picBox.info.curScale;
                if (picBox.info.curScale > PINCH_SCALE_MIN && picBox.info.curScale < PINCH_SCALE_MAX)
                    picBox.info.visibleScale = TARGET_SCALE;

                // Применение трансформации
                requestAnimationFrame(function() {
                    picBox.style.transform = picBox.style.webkitTransform = 'scale(' + picBox.info.visibleScale +', '+ picBox.info.visibleScale +') ';
                });
            }

            // Сохраняем дистанцию между точками для обработки следующего события перемещения
            prevDiff = curDiff;
        }        
    }

    function _onButtonPointerUp(e) {
        if (occurredEvents.length == 2) {
            checkCondition();
        }

        removeEvent(e);

        // Если число точек меньше двух, сбрасываем значение предыдущего расстояние между точками
        if (occurredEvents.length < 2) {
            prevDiff = -1;
            startAngle = 0;
        }        
    }

    function _checkCondition() {
        var isOpened = true;
        picBoxes.forEach(function(picBox) {
            if (picBox.info.visibleScale !== TARGET_SCALE) {
                isOpened = false;
            }
        });

        if (isOpened) {
            this.unlock();
        }
    }

    function removeEvent(e) {
        for (var i = 0; i < occurredEvents.length; i++) {
            if (occurredEvents[i].pointerId == e.pointerId) {
                occurredEvents.splice(i, 1);
                break;
            }
        }
    }

    // ==== END Напишите свой код для открытия третей двери здесь ====
}
Door2.prototype = Object.create(DoorBase.prototype);
Door2.prototype.constructor = DoorBase;

/**
 * Сундук
 * @class Box
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */
function Box(number, onUnlock) {
    DoorBase.apply(this, arguments);

    // ==== Напишите свой код для открытия сундука здесь ====
        
    // Сохраняем список букв, с информацией о их позиции и о зависимости от др буквы
    var letterCount = 6;
    var letters = [];
    for (var i = 0; i < letterCount; i++) {        
        var letter = this.popup.querySelector('.box-riddle__letter_' + i);        
        var prevLetter = this.popup.querySelector('.' + letter.dataset.prev);
        letter.info = {
            startPosition: {},           
            currentPosition: {},
            prev: prevLetter,
            pressed: false
        }
        letters.push(letter);
    }  

    // Сохраняем объект ключа
    var key = this.popup.querySelector('.box-riddle__key');
    key.info = {
            startPosition: {},           
            currentPosition: {},            
            pressed: false
        } 

    // Подписка букв на события указателя
    letters.forEach(function(l) {        
        l.addEventListener('pointerdown', _onObjPointerDown.bind(this));
        l.addEventListener('pointermove', _onObjPointerMove.bind(this));
        l.addEventListener('pointerup', _onLetterPointerUp.bind(this));
        l.addEventListener('pointercancel', _onLetterPointerUp.bind(this));
        l.addEventListener('pointerleave', _onLetterPointerUp.bind(this));
    }.bind(this));

    // Подписка ключа на события указателя
    var key = this.popup.querySelector('.box-riddle__key');
    key.addEventListener('pointerdown', _onObjPointerDown.bind(this));
    key.addEventListener('pointermove', _onObjPointerMove.bind(this));
    key.addEventListener('pointerup', _onKeyPointerUp.bind(this));
    key.addEventListener('pointercancel', _onKeyPointerUp.bind(this));
    key.addEventListener('pointerleave', _onKeyPointerUp.bind(this));

    // Обработчик события зажатия буквы
    function _onObjPointerDown(e) {
        var obj = e.target;   
        obj.setPointerCapture(e.pointerId);     
        obj.info.startPosition.X = e.pageX;
        obj.info.startPosition.Y = e.pageY;
        obj.info.currentPosition.X = e.pageX;  
        obj.info.currentPosition.Y = e.pageY;        
        obj.info.pressed = true;                    
    }

    // Обработчик события перемещения буквы
    function _onObjPointerMove(e) {
        var obj = e.target;
        if (!obj.info.pressed) {
            return;
        }

        obj.info.currentPosition.X = e.pageX;
        obj.info.currentPosition.Y = e.pageY;
        moveObj(obj);
    }

    // Обработчик события отжатия буквы
    function _onLetterPointerUp(e) {
        var letter = e.target;
        if (!letter.info.pressed) {
            return;
        }                
        letter.info.pressed = false;

        if (letter.info.prev !== null && !letter.info.prev.classList.contains('door-riddle__letter_swiped')) {
            requestAnimationFrame(function() {
                letter.style.transform = 'translate3d(0,0,0)';
                letter.style.webkitTransform = 'translate3d(0,0,0)';
            });             
        } else {
            requestAnimationFrame(function() {
                letter.style.opacity = 0;                
            });  
            letter.classList.add('door-riddle__letter_swiped');
        }
    }

    // Обработчик отжатия указателя от элемента ключ
    function _onKeyPointerUp(e) {
        var key = e.target;
        if (!key.info.pressed) {
            return;
        }                
        key.info.pressed = false;  


        var keyRect = key.getBoundingClientRect();
        var lockerRect = this.popup.querySelector('.box-riddle__locker').getBoundingClientRect();       
        if (hasIntersection(keyRect, lockerRect)) {
            this.unlock();
        }
        
        requestAnimationFrame(function() {
            key.style.transform = 'translate3d(0,0,0)';
            key.style.webkitTransform = 'translate3d(0,0,0)';
        });    
    }

    // Перемещение объекта
    function moveObj(obj) {          
        requestAnimationFrame(function() {
            var diffX = obj.info.currentPosition.X - obj.info.startPosition.X; 
            var diffY = obj.info.currentPosition.Y - obj.info.startPosition.Y;                
            obj.style.transform = 'translate3d('+ diffX +'px, '+ diffY +'px, 0px)';
            obj.style.webkitTransform = 'translate3d('+ diffX +'px, '+ diffY +'px, 0px)';          
        });        
    }

    // Пересечение прямоугольников
    function hasIntersection(a, b) {
        if (a.left < b.left + b.width && b.left < a.left + a.width && a.top < b.top + b.height)
            return b.top < a.top + a.height;
        else
            return false;
    }

    // ==== END Напишите свой код для открытия сундука здесь ====

    this.showCongratulations = function() {
        alert('Поздравляю! Игра пройдена!');
    };
}
Box.prototype = Object.create(DoorBase.prototype);
Box.prototype.constructor = DoorBase;
